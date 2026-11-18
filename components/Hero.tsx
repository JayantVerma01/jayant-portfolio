"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowDown, Download, Pause, Play, RotateCcw } from "lucide-react";
import { personalInfo } from "@/lib/data";
import { useRich3D } from "@/hooks/useRich3D";
import { useIntroAudio } from "./IntroAudio";
import BadgeFace from "./hero/BadgeFace";
import Envelope from "./hero/Envelope";
import { AboutPanel } from "./About";
import { SCENE } from "./hero/scene";
import { cardScreen, heroP } from "./hero/store";
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

  // Scroll scene: stretch the lanyard, snap it, reveal About.
  const sceneRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });
  const copyOpacity = useTransform(scrollYProgress, [0, SCENE.copyFadeTo], [1, 0]);
  const copyY = useTransform(scrollYProgress, [0, SCENE.copyFadeTo], [0, -48]);
  const copyVis = useTransform(scrollYProgress, (v) =>
    v > SCENE.copyFadeTo - 0.01 ? "hidden" : "visible",
  );
  // The ID card's scatter progress drives how much of About has appeared.
  const aboutP = useTransform(scrollYProgress, [SCENE.scatterFrom + 0.1, 0.78], [0, 1]);
  const aboutVis = useTransform(scrollYProgress, (v) =>
    v < SCENE.scatterFrom ? "hidden" : "visible",
  );
  useMotionValueEvent(scrollYProgress, "change", (v) => heroP.set(v));
  useEffect(() => {
    heroP.set(scrollYProgress.get());
  }, [scrollYProgress]);

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

  const [first] = personalInfo.name.split(" ");

  return (
    <section
      id={rich === true ? undefined : "home"}
      ref={sceneRef}
      className={`${styles.hero} ${rich === true ? styles.scene : ""}`}
    >
      {rich === true && (
        <>
          <span id="home" className={styles.anchorHome} aria-hidden="true" />
          <span id="about" className={styles.anchorAbout} aria-hidden="true" />
        </>
      )}
      <div className={styles.sticky}>
      <motion.div
        className={`container ${styles.grid}`}
        style={rich === true ? { opacity: copyOpacity, y: copyY, visibility: copyVis } : undefined}
      >
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.live} /> {personalInfo.availability.label}
          </p>

          <h1 className={styles.title}>
            Hi, I&apos;m {first}.
            <span className={styles.role} aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.em
                  key={roleIdx}
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -16, opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {personalInfo.taglines[roleIdx]}
                </motion.em>
              </AnimatePresence>
            </span>
          </h1>

          <p className={styles.sub}>
            I build production web apps and AI features, from the API to the
            interface.
          </p>

          <div className={styles.actions}>
            <button
              className={`${styles.listen} ${playing ? styles.listening : ""}`}
              onClick={audio.toggle}
              aria-label={playing ? "Pause introduction" : "Play introduction"}
              data-cursor={playing ? "Pause" : "Play"}
            >
              <span className={styles.listenIcon}>
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </span>
              <span>{playing ? "Playing" : "Hear my intro"}</span>
              <span className={styles.bars} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </button>
            <a className={styles.cta} href="#projects">
              See my work <ArrowDown size={16} />
            </a>
            <a className={styles.link} href={personalInfo.resume} download>
              <Download size={15} /> Résumé
            </a>
            {started && (
              <button
                className={styles.restart}
                onClick={audio.restart}
                aria-label="Restart introduction"
              >
                <RotateCcw size={15} />
              </button>
            )}
          </div>

          {started && (
            <div className={styles.captionWrap}>
              <p className={styles.caption} aria-live="off">
                {currentSentence.text.split(" ").map((w, i) => {
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
                })}
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
          )}
        </div>

        {rich === false && (
          <div className={styles.staticBadge}>
            <BadgeFace playing={playing} onPlay={audio.toggle} />
          </div>
        )}
      </motion.div>

      {rich === true && (
        <>
          {/* About: assembled from the scattered ID-card tiles */}
          <motion.div className={styles.aboutLayer} style={{ visibility: aboutVis }}>
            <AboutPanel progress={aboutP} />
          </motion.div>

          {/* Full-bleed 3D stage */}
          <div className={styles.stage}>
            <Lanyard
              playing={playing}
              onTap={audio.toggle}
              progress={scrollYProgress}
              screen={cardScreen}
            />
          </div>
          <Envelope progress={scrollYProgress} />
        </>
      )}
      </div>
    </section>
  );
}
