"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { personalInfo } from "@/lib/data";
import styles from "./Loader.module.css";

const SEEN_KEY = "jv-loader-seen";
const DURATION = 1600; // count-up
const EXIT_MS = 800; // must match the CSS transition in Loader.module.css
const HARD_LIMIT = 4000; // never keep a visitor waiting longer than this

type Phase = "show" | "leaving" | "gone";

/**
 * "Identity check" intro. Shown once per session, skippable, under 2s.
 * Driven by timers (not requestAnimationFrame or animation callbacks) so it
 * always finishes, even if the tab is throttled or animations are interrupted.
 */
export default function Loader() {
  const [phase, setPhase] = useState<Phase>("show");
  const [pct, setPct] = useState(0);
  const leaving = useRef(false);

  const finish = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
    setPct(100);
    setPhase("leaving");
    setTimeout(() => setPhase("gone"), EXIT_MS + 50);
  }, []);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduced) {
      // Skip straight past it (no exit animation needed).
      leaving.current = true;
      const id = setTimeout(() => setPhase("gone"), 0);
      return () => clearTimeout(id);
    }

    const start = Date.now();
    const tick = setInterval(() => {
      const t = Math.min((Date.now() - start) / DURATION, 1);
      setPct(Math.round((1 - Math.pow(1 - t, 3)) * 100));
      if (t >= 1) {
        clearInterval(tick);
        setTimeout(finish, 250);
      }
    }, 40);
    const hard = setTimeout(finish, HARD_LIMIT);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearInterval(tick);
      clearTimeout(hard);
      window.removeEventListener("keydown", onKey);
    };
  }, [finish]);

  // Lock page scroll only while the loader is up.
  useEffect(() => {
    const root = document.documentElement;
    root.style.overflow = phase === "show" ? "hidden" : "";
    return () => {
      root.style.overflow = "";
    };
  }, [phase]);

  if (phase === "gone") return null;

  const [first, last] = personalInfo.name.split(" ");

  return (
    <div
      className={`${styles.loader} ${phase === "leaving" ? styles.leaving : ""}`}
      role="status"
      aria-label="Loading portfolio"
      onClick={finish}
    >
      <div className={styles.top}>
        <span>Identity check</span>
        <span>{String(pct).padStart(3, "0")}%</span>
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
    </div>
  );
}
