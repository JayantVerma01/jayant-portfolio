"use client";

import { Pause, Play } from "lucide-react";
import { personalInfo } from "@/lib/data";
import styles from "./BadgeFace.module.css";

/** Static (non-3D) version of the ID badge. Mirrors drawBadge() in Lanyard.tsx. */
export default function BadgeFace({
  playing,
  onPlay,
}: {
  playing: boolean;
  onPlay: () => void;
}) {
  return (
    <div className={styles.face}>
      <div className={styles.photo}>
        {personalInfo.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={personalInfo.photo} alt={`Portrait of ${personalInfo.name}`} />
        ) : (
          <span className={styles.mono} aria-hidden="true">
            JV
          </span>
        )}
        <span className={styles.status}>
          <i /> Available
        </span>
      </div>

      <div className={styles.meta}>
        <h2 className={styles.name}>{personalInfo.name}</h2>
        <p className={styles.role}>{personalInfo.role}</p>
      </div>

      <button
        type="button"
        className={`${styles.play} ${playing ? styles.playing : ""}`}
        onClick={onPlay}
        aria-label={playing ? "Pause introduction" : "Play introduction"}
      >
        <span className={styles.playIcon}>
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </span>
        <span>{playing ? "Playing…" : "Hear my intro"}</span>
        <span className={styles.bars} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      </button>
    </div>
  );
}
