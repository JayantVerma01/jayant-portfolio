"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { intro } from "@/lib/data";

export type IntroStatus = "idle" | "playing" | "paused" | "ended";

interface IntroAudioCtx {
  status: IntroStatus;
  /** Index of the word currently being spoken (-1 before start). */
  wordIndex: number;
  /** 0..1 */
  progress: number;
  words: string[];
  sentences: { text: string; firstWord: number; lastWord: number }[];
  /** True while using the browser voice because no recording exists yet. */
  usingBrowserVoice: boolean;
  toggle: () => void;
  restart: () => void;
  stop: () => void;
}

const Ctx = createContext<IntroAudioCtx | null>(null);

export function useIntroAudio() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useIntroAudio must be used inside <IntroAudioProvider>");
  return c;
}

// ─── Script analysis ─────────────────────────────────────────────────────────
const SCRIPT = intro.script.trim();
const WORDS = SCRIPT.split(/\s+/);

/** Start character offset of each word in SCRIPT. */
const WORD_START: number[] = (() => {
  const out: number[] = [];
  let pos = 0;
  for (const w of WORDS) {
    pos = SCRIPT.indexOf(w, pos);
    out.push(pos);
    pos += w.length;
  }
  return out;
})();

/** Relative "spoken length" of each word, used to map audio time → word. */
const WEIGHT_CUM: number[] = (() => {
  let total = 0;
  const cum = WORDS.map((w) => {
    total += w.length + (/[.!?:]$/.test(w) ? 6 : /,$/.test(w) ? 3 : 0);
    return total;
  });
  return cum.map((c) => c / total);
})();

const SENTENCES = (() => {
  const out: { text: string; firstWord: number; lastWord: number; start: number }[] = [];
  let first = 0;
  WORDS.forEach((w, i) => {
    if (/[.!?]$/.test(w) || i === WORDS.length - 1) {
      out.push({
        text: WORDS.slice(first, i + 1).join(" "),
        firstWord: first,
        lastWord: i,
        start: WORD_START[first],
      });
      first = i + 1;
    }
  });
  return out;
})();

function wordFromChar(char: number) {
  let idx = 0;
  for (let i = 0; i < WORD_START.length; i++) {
    if (WORD_START[i] <= char) idx = i;
    else break;
  }
  return idx;
}
function wordFromProgress(p: number) {
  const i = WEIGHT_CUM.findIndex((c) => c >= p);
  return i === -1 ? WORDS.length - 1 : i;
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function IntroAudioProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<IntroStatus>("idle");
  const [wordIndex, setWordIndex] = useState(-1);
  const [progress, setProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const runId = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const boundarySeen = useRef(false);

  const hasRecording = Boolean(intro.src);

  const clearTimer = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  const reset = useCallback((next: IntroStatus) => {
    clearTimer();
    setStatus(next);
    setWordIndex(next === "ended" ? WORDS.length - 1 : -1);
    setProgress(next === "ended" ? 1 : 0);
  }, []);

  // ── Real recording ────────────────────────────────────────────────────────
  const startRecording = useCallback(() => {
    let a = audioRef.current;
    if (!a) {
      a = new Audio(intro.src);
      a.preload = "auto";
      a.addEventListener("timeupdate", () => {
        if (!a || !a.duration) return;
        const p = a.currentTime / a.duration;
        setProgress(p);
        setWordIndex(wordFromProgress(p));
      });
      a.addEventListener("ended", () => reset("ended"));
      audioRef.current = a;
    }
    a.currentTime = 0;
    void a.play();
    setStatus("playing");
  }, [reset]);

  // ── Browser voice fallback (temporary until a recording exists) ───────────
  const startSpeech = useCallback(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const id = ++runId.current;
    boundarySeen.current = false;

    const voices = synth.getVoices();
    const voice =
      voices.find((v) => v.lang === "en-IN") ??
      voices.find((v) => v.lang.startsWith("en")) ??
      null;

    SENTENCES.forEach((s, i) => {
      const u = new SpeechSynthesisUtterance(s.text);
      if (voice) u.voice = voice;
      u.lang = voice?.lang ?? "en-US";
      u.rate = 0.98;
      u.onstart = () => {
        if (id !== runId.current) return;
        setWordIndex(s.firstWord);
        setProgress(s.firstWord / WORDS.length);
        // Estimate position inside the sentence if the voice sends no word events.
        clearTimer();
        const t0 = performance.now();
        const est = s.text.length * 62;
        timer.current = setInterval(() => {
          if (boundarySeen.current || id !== runId.current) return;
          const f = Math.min((performance.now() - t0) / est, 0.99);
          const w = s.firstWord + Math.floor(f * (s.lastWord - s.firstWord + 1));
          setWordIndex(w);
          setProgress(w / WORDS.length);
        }, 90);
      };
      u.onboundary = (e) => {
        if (id !== runId.current || e.name !== "word") return;
        boundarySeen.current = true;
        const w = wordFromChar(s.start + e.charIndex);
        setWordIndex(w);
        setProgress(w / WORDS.length);
      };
      if (i === SENTENCES.length - 1) {
        u.onend = () => id === runId.current && reset("ended");
      }
      u.onerror = (e) => {
        if (id !== runId.current || e.error === "canceled" || e.error === "interrupted") return;
        reset("idle");
      };
      synth.speak(u);
    });
    setStatus("playing");
  }, [reset]);

  const start = useCallback(() => {
    if (hasRecording) startRecording();
    else startSpeech();
  }, [hasRecording, startRecording, startSpeech]);

  const stop = useCallback(() => {
    runId.current++;
    window.speechSynthesis?.cancel();
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    reset("idle");
  }, [reset]);

  const toggle = useCallback(() => {
    if (status === "playing") {
      if (hasRecording) audioRef.current?.pause();
      else window.speechSynthesis?.pause();
      setStatus("paused");
    } else if (status === "paused") {
      if (hasRecording) void audioRef.current?.play();
      else window.speechSynthesis?.resume();
      setStatus("playing");
    } else {
      start();
    }
  }, [status, hasRecording, start]);

  const restart = useCallback(() => {
    stop();
    // let cancel() settle before queueing again
    setTimeout(start, 60);
  }, [stop, start]);

  useEffect(
    () => () => {
      runId.current++;
      window.speechSynthesis?.cancel();
      audioRef.current?.pause();
      clearTimer();
    },
    [],
  );

  const value = useMemo<IntroAudioCtx>(
    () => ({
      status,
      wordIndex,
      progress,
      words: WORDS,
      sentences: SENTENCES,
      usingBrowserVoice: !hasRecording,
      toggle,
      restart,
      stop,
    }),
    [status, wordIndex, progress, hasRecording, toggle, restart, stop],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
