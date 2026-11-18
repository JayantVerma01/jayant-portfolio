"use client";

import { useEffect, useRef } from "react";
import styles from "./Cursor.module.css";

/**
 * Soft follower ring for mouse users. The native cursor stays visible
 * (accessibility); the ring grows over interactive elements and shows an
 * optional label from a `data-cursor="Label"` attribute.
 */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = ring.current;
    if (!fine || reduced || !el) return;

    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;

    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      el.dataset.show = "1";
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "a, button, [data-cursor], summary, label",
      );
      const text = target?.dataset.cursor ?? "";
      el.dataset.state = target ? (text ? "label" : "link") : "idle";
      if (label.current) label.current.textContent = text;
    };
    const onLeave = () => delete el.dataset.show;

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ring} className={styles.ring} data-state="idle" aria-hidden="true">
      <span ref={label} className={styles.label} />
    </div>
  );
}
