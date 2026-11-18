"use client";

import { useActiveSection } from "@/hooks/useActiveSection";
import { navLinks } from "@/lib/data";
import styles from "./DotNav.module.css";

const ids = navLinks.map((l) => l.href.slice(1));

/** Side progress dots (desktop). Each dot jumps to its section. */
export default function DotNav() {
  const active = useActiveSection(ids);

  return (
    <nav className={styles.dots} aria-label="Section progress">
      {navLinks.map((l) => {
        const on = active === l.href.slice(1);
        return (
          <a
            key={l.href}
            href={l.href}
            className={`${styles.dot} ${on ? styles.on : ""}`}
            aria-label={l.label}
            aria-current={on ? "true" : undefined}
          >
            <span className={styles.label}>{l.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
