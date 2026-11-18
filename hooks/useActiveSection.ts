"use client";

import { useEffect, useState } from "react";

/** Returns the id of the section currently crossing the middle of the viewport. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  const key = ids.join("|");

  useEffect(() => {
    let io: IntersectionObserver | null = null;
    const setup = () => {
      io?.disconnect();
      const els = key
        .split("|")
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => !!el);
      if (!els.length) return;
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
        },
        { rootMargin: "-45% 0px -50% 0px" },
      );
      els.forEach((el) => io!.observe(el));
    };
    setup();
    // The home scene swaps its anchors once the 3D check resolves, so look again.
    const t1 = window.setTimeout(setup, 700);
    const t2 = window.setTimeout(setup, 2500);
    return () => {
      io?.disconnect();
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [key]);

  return active;
}
