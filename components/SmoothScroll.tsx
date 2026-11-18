"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Smooth (not hijacked) scrolling via Lenis. Disabled for users who prefer
 * reduced motion. Elements with `data-lenis-prevent` keep native scrolling.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      anchors: true,
      autoRaf: true,
    });
    return () => lenis.destroy();
  }, []);

  return <>{children}</>;
}
