"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, Download, Pause, Play, RotateCcw } from "lucide-react";
import { kpis, personalInfo } from "@/lib/data";
import { useRich3D } from "@/hooks/useRich3D";
import { useIntroAudio } from "./IntroAudio";
import CountUp from "./CountUp";
import BadgeFace from "./hero/BadgeFace";
import styles from "./Hero.module.css";

const Lanyard = dynamic(() => import("./hero/Lanyard"), { ssr: false });

/** Chips that light up when the matching phrase is spoken in the intro. */
const CUES = [
  { label: "HG Infra", match: "HG Infra" },
  { label: "E-commerce", match: "e-commerce" },
  { label: "RAG", match: "RAG" },
  { label: "LangGraph", match: "LangGraph" },
  { label: "SAP", match: "SAP" },
  { label: "Razorpay", match: "Razorpay" },
];

export default function Hero() {
  const audio = useIntroAudio();
  const rich = useRich3D();
  const [roleIdx, setRoleIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setRoleIdx((i) => (i + 1) % personalInfo.taglines.length),
      2600,
    );
    return () => clearInterval(t);
  }, []);

  const playing = audio.status === "playing";
  const started = audio.status !== "idle";

  const spoken = useMemo(
    () => audio.words.slice(0, Math.max(audio.wordIndex + 1, 0)).join(" "),
    [audio.words, audio.wordIndex],
  );
  const lit = (m: string) =>
    audio.status === "ended" || spoken.toLowerCase().includes(m.toLowerCase());

  const currentSentence =
    audio.sentences.find((s) => audio.wordIndex >= s.firstWord && audio.wordIndex <= s.lastWord) ??
    audio.sentences[audio.status === "ended" ? audio.sentences.length - 1 : 0];

  const [first, last] = personalInfo.name.split(" ");

  return (
    <section id="home" className={styles.hero}>
      <div className={styles.glow} aria-hidden="true" />

      <h1 className={styles.giant} aria-label={personalInfo.name}>
        <span aria-hidden="true">
          {first} <em>{last}</em>
        </span>
      </h1>

      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.live} /> Portfolio / 2026
          </p>

          <p className={styles.lead}>
            Hello, I&apos;m {first}, a{" "}
            <span className={styles.role} aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.em
                  key={roleIdx}
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -18, opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {personalInfo.taglines[roleIdx]}
                </motion.em>
              </AnimatePresence>
            </span>{" "}
            from {personalInfo.location.split(",")[0]}.
          </p>

          <p className={styles.sub}>
            I build production web apps and AI features end to end: APIs, data,
            integrations and the interface on top.
          </p>

          {/* Intro player + live captions */}
          <div className={`${styles.player} ${playing ? styles.playingState : ""}`}>
            <div className={styles.controls}>
              <button
                className={styles.playBtn}
                onClick={audio.toggle}
                aria-label={playing ? "Pause introduction" : "Play introduction"}
                data-cursor={playing ? "Pause" : "Play"}
              >
                {playing ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <div className={styles.wave} aria-hidden="true">
                {Array.from({ length: 28 }, (_, i) => (
                  <i key={i} style={{ animationDelay: `${(i % 7) * 0.09}s` }} />
                ))}
              </div>
              <span className={styles.timeLabel}>
                {started ? `${Math.round(audio.progress * 100)}%` : "~35 sec"}
              </span>
              {started && (
                <button
                  className={styles.ghostBtn}
                  onClick={audio.restart}
                  aria-label="Restart introduction"
                >
                  <RotateCcw size={15} />
                </button>
              )}
            </div>

            <p className={styles.caption} aria-live="off">
              {started ? (
                currentSentence.text.split(" ").map((w, i) => {
                  const gi = currentSentence.firstWord + i;
                  const cls =
                    gi === audio.wordIndex
                      ? styles.wNow
                      : gi < audio.wordIndex || audio.status === "ended"
                        ? styles.wDone
                        : styles.wNext;
                  return (
                    <span key={gi} className={cls}>
                      {w}{" "}
                    </span>
                  );
                })
              ) : (
                <span className={styles.hint}>
                  Press play and hear me introduce myself.
                </span>
              )}
            </p>

            <ul className={styles.cues} aria-label="Topics mentioned in the intro">
              {CUES.map((c) => (
                <li key={c.label} className={lit(c.match) ? styles.cueOn : ""}>
                  {c.label}
                </li>
              ))}
            </ul>

            {audio.usingBrowserVoice && (
              <p className={styles.note}>Preview voice. My own recording is coming.</p>
            )}
          </div>

          <div className={styles.ctas}>
            <a className={styles.cta} href="#projects">
              See my work <ArrowDown size={16} />
            </a>
            <a className={styles.ctaGhost} href={personalInfo.resume} download>
              <Download size={16} /> Résumé
            </a>
          </div>

          <ul className={styles.kpis}>
            {kpis.map((k) => (
              <li key={k.label}>
                <strong>
                  <CountUp value={k.value} suffix={k.suffix} />
                </strong>
                <span>{k.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Badge */}
        <div className={styles.badgeWrap}>
          {rich === true && <Lanyard playing={playing} onTap={audio.toggle} />}
          {rich === false && (
            <div className={styles.staticBadge}>
              <BadgeFace playing={playing} onPlay={audio.toggle} />
            </div>
          )}
          {rich === true && (
            <p className={styles.dragHint} aria-hidden="true">
              drag me · click to play
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
