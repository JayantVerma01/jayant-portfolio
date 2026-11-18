"use client";

import { ArrowUp } from "lucide-react";
import { navLinks, personalInfo } from "@/lib/data";
import styles from "./Footer.module.css";

const BUILT_WITH = ["Next.js", "React", "Three.js", "GSAP", "Framer Motion"];

export default function Footer() {
  const [first, last] = personalInfo.name.split(" ");

  return (
    <footer className={styles.footer}>
      <div className="container">
        <p className={styles.end}>
          <span /> That&apos;s the whole page. Thanks for listening. <span />
        </p>

        <div className={styles.cols}>
          <nav aria-label="Footer">
            <ul className={styles.links}>
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <ul className={styles.built} aria-label="Built with">
            {BUILT_WITH.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>

          <a className={styles.top} href="#home" aria-label="Back to top">
            <ArrowUp size={18} />
          </a>
        </div>

        <p className={styles.giant} aria-hidden="true">
          {first} <em>{last}</em>
        </p>

        <p className={styles.copy}>
          © {new Date().getFullYear()} {personalInfo.name}. Designed and built by me.
        </p>
      </div>
    </footer>
  );
}
