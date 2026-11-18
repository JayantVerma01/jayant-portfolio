"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { personalInfo } from "@/lib/data";
import styles from "./Loader.module.css";

const SEEN_KEY = "jv-loader-seen";
const DURATION = 1800;

/** "Identity check" intro. Shown once per session, skippable, under 2s. */
export default function Loader() {
  const [visible, setVisible] = useState(true);
  const [pct, setPct] = useState(0);

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
    setVisible(false);
  }, []);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduced) {
      const id = requestAnimationFrame(finish);
      return () => cancelAnimationFrame(id);
    }

    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      setPct(Math.round((1 - Math.pow(1 - t, 3)) * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(finish, 250);
    };
    raf = requestAnimationFrame(tick);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, [finish]);

  // Lock page scroll while the loader is up.
  useEffect(() => {
    const root = document.documentElement;
    root.style.overflow = visible ? "hidden" : "";
    return () => {
      root.style.overflow = "";
    };
  }, [visible]);

  const pad = String(pct).padStart(3, "0");
  const [first, last] = personalInfo.name.split(" ");

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.loader}
          role="status"
          aria-label="Loading portfolio"
          onClick={finish}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className={styles.top}>
            <span>Identity check</span>
            <span>{pad}%</span>
          </div>

          <div className={styles.center}>
            <p className={styles.name}>
              {first} <em>{last}</em>
            </p>
            <p className={styles.role}>{personalInfo.role}</p>
          </div>

          <div className={styles.bottom}>
            <span>{pct < 100 ? "Aligning…" : "Verified"}</span>
            <span className={styles.skip}>Click to skip</span>
          </div>
          <div className={styles.bar} style={{ transform: `scaleX(${pct / 100})` }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
