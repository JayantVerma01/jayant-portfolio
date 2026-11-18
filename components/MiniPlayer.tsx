"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, X } from "lucide-react";
import { useIntroAudio } from "./IntroAudio";
import styles from "./MiniPlayer.module.css";

/** Keeps the intro controllable after the visitor scrolls past the hero. */
export default function MiniPlayer() {
  const audio = useIntroAudio();
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    const el = document.getElementById("home");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setHeroVisible(e.isIntersecting), {
      threshold: 0.15,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const active = audio.status === "playing" || audio.status === "paused";
  const sentence =
    audio.sentences.find((s) => audio.wordIndex >= s.firstWord && audio.wordIndex <= s.lastWord)
      ?.text ?? "";

  return (
    <AnimatePresence>
      {active && !heroVisible && (
        <motion.div
          className={styles.mini}
          role="region"
          aria-label="Introduction player"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <button
            className={styles.btn}
            onClick={audio.toggle}
            aria-label={audio.status === "playing" ? "Pause introduction" : "Resume introduction"}
          >
            {audio.status === "playing" ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <p className={styles.text}>{sentence}</p>
          <button className={styles.close} onClick={audio.stop} aria-label="Stop introduction">
            <X size={15} />
          </button>
          <span className={styles.progress} style={{ transform: `scaleX(${audio.progress})` }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
