"use client";

import { useEffect, useRef, useState } from "react";

/** Tracks whether an element is on screen (with a small margin). */
export function useInView<T extends HTMLElement>(margin = "100px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin: margin,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);

  return [ref, inView] as const;
}
