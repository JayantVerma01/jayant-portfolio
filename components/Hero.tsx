"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { ArrowDown, Download, Mail } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { personalInfo } from "@/lib/data";
import styles from "./Hero.module.css";

const TECH_ICONS = [
  { icon: "⚛️", label: "React", x: -60, y: -40, delay: 0 },
  { icon: "▲", label: "Next.js", x: 60, y: -50, delay: 0.5 },
  { icon: "🟩", label: "Node.js", x: -80, y: 40, delay: 1 },
  { icon: "🤖", label: "AI", x: 80, y: 50, delay: 1.5 },
  { icon: "🔷", label: "TypeScript", x: -40, y: 80, delay: 2 },
  { icon: "💎", label: "MongoDB", x: 50, y: 80, delay: 0.8 },
];

const SOCIAL = [
  { href: personalInfo.github, icon: <FaGithub size={18} />, label: "GitHub" },
  { href: personalInfo.linkedin, icon: <FaLinkedin size={18} />, label: "LinkedIn" },
  { href: `mailto:${personalInfo.email}`, icon: <Mail size={18} />, label: "Email" },
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className={styles.hero} ref={containerRef}>
      {/* Animated background blobs */}
      <div className={styles.blobs} aria-hidden="true">
        <motion.div
          className={`${styles.blob} ${styles.blob1}`}
          animate={{
            scale: [1, 1.2, 0.9, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className={`${styles.blob} ${styles.blob2}`}
          animate={{
            scale: [1.1, 0.9, 1.2, 1.1],
            rotate: [360, 270, 180, 90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className={`${styles.blob} ${styles.blob3}`}
          animate={{
            scale: [0.9, 1.1, 1, 0.9],
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid overlay */}
      <div className={styles.grid} aria-hidden="true" />

      <motion.div className={styles.content} style={{ y, opacity }}>
        {/* Status badge */}
        <motion.div
          className={styles.statusBadge}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <span className={styles.statusDot} />
          <span>Available for opportunities</span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          className={styles.heading}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={styles.wave}>👋</span>
          <br />
          Hi, I&apos;m{" "}
          <span className="gradient-text">Jayant Verma</span>
        </motion.h1>

        {/* Type animation */}
        <motion.div
          className={styles.typeWrapper}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <span className={styles.typePrefix}>I build </span>
          <span className={styles.typeText}>
            <TypeAnimation
              sequence={[
                "Full Stack Applications",
                2000,
                "Next.js Experiences",
                2000,
                "Node.js APIs",
                2000,
                "AI-Powered Solutions",
                2000,
                "Scalable Systems",
                2000,
              ]}
              wrapper="span"
              speed={40}
              deletionSpeed={60}
              repeat={Infinity}
            />
            <span className={styles.cursor}>|</span>
          </span>
        </motion.div>

        {/* Bio */}
        <motion.p
          className={styles.bio}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.8 }}
        >
          Full Stack Developer with{" "}
          <strong style={{ color: "var(--accent-primary)" }}>1.5+ years</strong>{" "}
          of experience building scalable web applications and AI-powered solutions. I build seamless web experiences with React.js and Next.js, and robust backend APIs with Node.js. I love exploring the intersection of web development and AI to create intelligent, user-centric products.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className={styles.ctas}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <motion.button
            className="btn btn-primary"
            onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View My Work
            <ArrowDown size={16} />
          </motion.button>
          <motion.a
            href={personalInfo.resume}
            download="JAYANT VERMA RESUME.pdf"
            className="btn btn-outline"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download size={16} />
            Download CV
          </motion.a>
        </motion.div>

        {/* Socials */}
        <motion.div
          className={styles.socials}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          {SOCIAL.map((s, i) => (
            <motion.a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialBtn}
              aria-label={s.label}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.1, type: "spring" }}
              whileHover={{ scale: 1.2, y: -4 }}
              whileTap={{ scale: 0.9 }}
            >
              {s.icon}
            </motion.a>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          className={styles.stats}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          {[
            { num: personalInfo.experienceYears, label: "Years Experience" },
            { num: personalInfo.projectsCount, label: "Projects Shipped" },
            { num: personalInfo.technologiesCount, label: "Technologies" },
          ].map((s, i) => (
            <div key={i} className={styles.stat}>
              <span className={styles.statNum}>{s.num}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Floating tech icons */}
      <div className={styles.floatingIcons} aria-hidden="true">
        {TECH_ICONS.map((t, i) => (
          <motion.div
            key={t.label}
            className={styles.floatIcon}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5 + t.delay * 0.3, type: "spring", bounce: 0.4 }}
            style={{ x: t.x * 3, y: t.y * 2 } as import("framer-motion").MotionStyle}
          >
            <motion.div
              animate={{ y: [0, -12, 0], rotate: [-3, 3, -3] }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: t.delay,
                ease: "easeInOut",
              }}
              className={styles.floatIconInner}
              title={t.label}
            >
              {t.icon}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.button
        className={styles.scrollIndicator}
        onClick={scrollToAbout}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        whileHover={{ scale: 1.1 }}
        aria-label="Scroll to about"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown size={20} />
        </motion.div>
      </motion.button>
    </section>
  );
}
