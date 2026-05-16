"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { skills } from "@/lib/data";
import styles from "./Skills.module.css";

export default function Skills() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <section id="skills" className={`section ${styles.skills}`}>
      <div className="container">
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-tag">Skills</span>
          <h2 className="section-title">
            My Technical{" "}
            <span className="gradient-text">Expertise</span>
          </h2>
          <p className="section-subtitle">
            A comprehensive toolkit built through hands-on project experience and continuous learning.
          </p>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          className={styles.tabs}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {skills.map((cat, i) => (
            <motion.button
              key={cat.category}
              className={`${styles.tab} ${activeCategory === i ? styles.tabActive : ""}`}
              onClick={() => setActiveCategory(i)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={activeCategory === i ? { borderColor: cat.color, boxShadow: `0 0 20px ${cat.color}30` } : {}}
            >
              <span>{cat.icon}</span>
              <span>{cat.category}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Skills grid */}
        <div className={styles.content} ref={ref}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              className={styles.skillPanel}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {skills[activeCategory].items.map((skill, i) => (
                <motion.div
                  key={skill.name}
                  className={`glass-card ${styles.skillCard}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ 
                    scale: 1.05, 
                    borderColor: skills[activeCategory].color,
                    boxShadow: `0 8px 30px ${skills[activeCategory].color}20` 
                  }}
                >
                  <span className={styles.skillName}>{skill.name}</span>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* All skills overview - cloud */}
        <motion.div
          className={styles.cloudSection}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h3 className={styles.cloudTitle}>All Technologies</h3>
          <div className={styles.cloud}>
            {skills.flatMap((cat) =>
              cat.items.map((s) => ({
                name: s.name,
                color: cat.color,
              }))
            ).map((s, i) => (
              <motion.span
                key={s.name}
                className={styles.cloudTag}
                style={{ borderColor: `${s.color}40`, color: s.color, background: `${s.color}10` }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.1, background: `${s.color}20` }}
              >
                {s.name}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
