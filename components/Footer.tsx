"use client";

import { motion } from "framer-motion";
import { Heart, Mail, ArrowUp } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { personalInfo, navLinks } from "@/lib/data";
import styles from "./Footer.module.css";

export default function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className={styles.footer}>
      {/* Top gradient line */}
      <div className={styles.topLine} />

      <div className="container">
        <div className={styles.inner}>
          {/* Left: logo + tagline */}
          <div className={styles.brand}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>JV</div>
              <span className={styles.logoText}>Jayant Verma</span>
            </div>
            <p className={styles.tagline}>
              Building the future of the web, one commit at a time.
            </p>
            <div className={styles.socials}>
              {[
                { href: personalInfo.github, icon: <FaGithub size={16} /> },
                { href: personalInfo.linkedin, icon: <FaLinkedin size={16} /> },
                { href: `mailto:${personalInfo.email}`, icon: <Mail size={16} /> },
              ].map((s, i) => (
                <motion.a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Center: nav links */}
          <nav className={styles.nav}>
            <span className={styles.navTitle}>Quick Links</span>
            {navLinks.map((link) => (
              <button
                key={link.href}
                className={styles.navLink}
                onClick={() => {
                  const id = link.href.slice(1);
                  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right: tech stack */}
          <div className={styles.stack}>
            <span className={styles.navTitle}>Built With</span>
            {["Next.js 14", "TypeScript", "Framer Motion", "CSS Modules"].map((t) => (
              <span key={t} className={styles.stackItem}>{t}</span>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className={styles.bottom}>
          <p className={styles.copy}>
            © {new Date().getFullYear()} Jayant Verma. Made with{" "}
            <Heart size={14} fill="currentColor" style={{ color: "#ef4444", display: "inline" }} />{" "}
            in India.
          </p>
          <motion.button
            className={styles.scrollTop}
            onClick={scrollTop}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Scroll to top"
          >
            <ArrowUp size={16} />
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
