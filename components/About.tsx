"use client";

import { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";
import { personalInfo } from "@/lib/data";
import { Code2, Cpu, Globe, Zap } from "lucide-react";
import styles from "./About.module.css";

const HIGHLIGHTS = [
  { icon: <Globe size={20} />, title: "Full Stack", desc: "End-to-end application development from UI to database", color: "#6366f1" },
  { icon: <Cpu size={20} />, title: "AI Integration", desc: "Integrating intelligence into every product I build", color: "#06b6d4" },
  { icon: <Code2 size={20} />, title: "Clean Code", desc: "Readable, maintainable, scalable architecture", color: "#8b5cf6" },
  { icon: <Zap size={20} />, title: "Performance", desc: "Optimizing for speed, scale, and reliability", color: "#10b981" },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className={`section ${styles.about}`}>
      <div className="container">
        {/* Section header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-tag">About Me</span>
          <h2 className="section-title">
            Crafting Digital{" "}
            <span className="gradient-text">Experiences</span>
          </h2>
          <p className="section-subtitle">
            Passionate developer on a mission to build products that make a difference.
          </p>
        </motion.div>

        <div className={styles.grid}>
          {/* Left: Bio card */}
          <motion.div
            className={styles.bioCard}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Avatar */}
            <div className={styles.avatarWrapper}>
              <div className={styles.avatarRing} />
              <div className={styles.avatar}>
                <span className={styles.avatarInitials}>JV</span>
              </div>
              <div className={styles.avatarGlow} />
            </div>

            {/* Info (• AI Enthusiast) */}
            <div className={styles.bioInfo}>
              <h3 className={styles.bioName}>Jayant Verma</h3>
              <p className={styles.bioRole}>Full Stack Developer </p>

              <p className={styles.bioText}>{personalInfo.bio}</p>

              <div className={styles.bioMeta}>
                {[
                  { label: "Email", value: "vermajayant03@gmail.com" },
                  { label: "Phone No.", value: "+91 9588965801" },
                  { label: "Experience", value: "1.5+ Years" },
                  { label: "Status", value: "Open to Work ✅" },
                ].map((m) => (
                  <div key={m.label} className={styles.metaItem}>
                    <span className={styles.metaLabel}>{m.label}</span>
                    <span className={styles.metaValue}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Highlights + Journey */}
          <div className={styles.right}>
            {/* Highlight cards */}
            <motion.div
              className={styles.highlights}
              ref={ref}
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {HIGHLIGHTS.map((h) => (
                <motion.div
                  key={h.title}
                  className={`glass-card ${styles.highlightCard}`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, y: -4 }}
                >
                  <div
                    className={styles.highlightIcon}
                    style={{ color: h.color, background: `${h.color}18` }}
                  >
                    {h.icon}
                  </div>
                  <div>
                    <h4 className={styles.highlightTitle}>{h.title}</h4>
                    <p className={styles.highlightDesc}>{h.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Journey timeline */}
            <motion.div
              className={`glass-card ${styles.journeyCard}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <h4 className={styles.journeyTitle}>🛣️ My Journey</h4>
              <div className={styles.timeline}>
                {[
                  { year: "2023", event: "Started journey in web development", color: "#6366f1" },
                  { year: "2024", event: "Backend Developer Intern @ Fixl Solutions — Built production APIs", color: "#8b5cf6" },
                  { year: "2025", event: "Backend Developer Trainee @ Hornet Dynamics — Full stack projects", color: "#06b6d4" },
                  { year: "Now", event: "Full Stack Developer @ HG Infra Engineering Ltd — Building EPC solutions. Open to freelance ", color: "#10b981" },
                ].map((t, i) => (
                  <motion.div
                    key={t.year}
                    className={styles.timelineItem}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + 0.5 }}
                  >
                    <div className={styles.timelineDot} style={{ borderColor: t.color, boxShadow: `0 0 10px ${t.color}40` }} />
                    <span className={styles.timelineYear} style={{ color: t.color }}>{t.year}</span>
                    <span className={styles.timelineEvent}>{t.event}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
