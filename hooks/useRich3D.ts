"use client";

import { useEffect, useState } from "react";

function detect() {
  // tablets get the same scenes as desktop; only phones fall back
  const fine = true;
  const wide = window.matchMedia("(min-width: 700px)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || !wide || reduced) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Whether to render WebGL experiences. `null` until the client has decided
 * (so server and first client render match).
 */
export function useRich3D() {
  const [rich, setRich] = useState<boolean | null>(null);
  useEffect(() => {
    // Timer, not requestAnimationFrame: rAF is paused in background/throttled tabs.
    const id = setTimeout(() => setRich(detect()), 0);
    return () => clearTimeout(id);
  }, []);
  return rich;
}
