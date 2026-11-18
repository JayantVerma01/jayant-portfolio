"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import HireSheet from "./HireSheet";
import { useActiveSection } from "@/hooks/useActiveSection";
import { navLinks, personalInfo } from "@/lib/data";
import styles from "./Navbar.module.css";

const ids = navLinks.map((l) => l.href.slice(1));

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hireOpen, setHireOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const active = useActiveSection(ids);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        className={`${styles.wrap} ${scrolled ? styles.scrolled : ""}`}
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <nav className={styles.pill} aria-label="Primary">
          <a href="#home" className={styles.logo} aria-label="Jayant Verma — home">
            <span className={styles.mark}>JV</span>
          </a>

          <ul className={styles.links}>
            {navLinks.map((link) => {
              const isActive = active === link.href.slice(1);
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`${styles.link} ${isActive ? styles.active : ""}`}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {isActive && (
                      <motion.span
                        className={styles.activePill}
                        layoutId="nav-active"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                    <span className={styles.linkLabel}>{link.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          <div className={styles.actions}>
            {personalInfo.availability.open && (
              <span className={styles.status}>
                <span className={styles.statusDot} aria-hidden="true" />
                {personalInfo.availability.label}
              </span>
            )}

            <button
              className={styles.iconBtn}
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button className={styles.hire} onClick={() => setHireOpen(true)}>
              Hire me
            </button>

            <button
              className={`${styles.iconBtn} ${styles.burger}`}
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className={styles.mobile}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <ul>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`${styles.mobileLink} ${active === link.href.slice(1) ? styles.mobileActive : ""}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <HireSheet open={hireOpen} onClose={() => setHireOpen(false)} />
    </>
  );
}
