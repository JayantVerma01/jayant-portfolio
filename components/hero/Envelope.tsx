"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "framer-motion";
import { sheetBump, sheetFrac } from "./scene";
import styles from "./Envelope.module.css";

/**
 * The page "closing": a sheet in the page's own colour is hauled up from the
 * bottom of the screen by Luffy's rubber hand, leaving a clean blank page for
 * Skills. The top edge bows upward where his hand grips it.
 */
export default function Envelope({ progress }: { progress: MotionValue<number> }) {
  const path = useRef<SVGPathElement>(null);

  useEffect(() => {
    const draw = () => {
      const el = path.current;
      if (!el) return;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const f = sheetFrac(progress.get());
      if (f <= 0.001) {
        el.setAttribute("d", "");
        return;
      }
      const y = H * (1 - f) - (f >= 0.999 ? 40 : 0);
      const bump = sheetBump(f);
      el.setAttribute(
        "d",
        `M-10 ${H + 40} L-10 ${y.toFixed(1)} Q${(W / 2).toFixed(1)} ${(y - bump).toFixed(1)} ${W + 10} ${y.toFixed(1)} L${W + 10} ${H + 40} Z`,
      );
    };
    draw();
    const off = progress.on("change", draw);
    window.addEventListener("resize", draw);
    return () => {
      off();
      window.removeEventListener("resize", draw);
    };
  }, [progress]);

  return (
    <div className={styles.sheet} aria-hidden="true">
      <svg className={styles.svg}>
        <path ref={path} />
      </svg>
    </div>
  );
}
