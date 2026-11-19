"use client";

import { useEffect, useState } from "react";

function detect() {
  // The pinned scroll scenes are made for landscape screens. Phones and portrait tablets
  // (tall, narrow) get the stacked layouts instead, so they never show empty pinned screens.
  const roomy = window.matchMedia("(min-width: 700px) and (min-aspect-ratio: 11/10)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!roomy || reduced) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Whether to render the WebGL / pinned-scene experiences. `null` until the client has
 * decided (so server and first client render match). It is decided once per page load,
 * and re-decided only when the screen shape really changes (e.g. rotating a tablet).
 */
export function useRich3D() {
  const [rich, setRich] = useState<boolean | null>(null);
  useEffect(() => {
    // Timer, not requestAnimationFrame: rAF is paused in background/throttled tabs.
    const id = setTimeout(() => setRich(detect()), 0);
    const mq = window.matchMedia("(min-width: 700px) and (min-aspect-ratio: 11/10)");
    const onChange = () => setRich(detect());
    mq.addEventListener("change", onChange);
    return () => {
      clearTimeout(id);
      mq.removeEventListener("change", onChange);
    };
  }, []);
  return rich;
}

function detectGallery() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** The 3D project carousel works on every screen size (phone, tablet and desktop). */
export function useGallery3D() {
  const [on, setOn] = useState<boolean | null>(null);
  useEffect(() => {
    const id = setTimeout(() => setOn(detectGallery()), 0);
    return () => clearTimeout(id);
  }, []);
  return on;
}
