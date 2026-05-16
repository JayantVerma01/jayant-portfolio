"use client";

import { motion } from "framer-motion";
import { Briefcase, Calendar, MapPin, CheckCircle2 } from "lucide-react";
import { experience } from "@/lib/data";
import styles from "./Experience.module.css";

export default function Experience() {
  return (
    <section id="experience" className={`section ${styles.experience}`}>
      <div className="container">
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-tag">Experience</span>
          <h2 className="section-title">
            Professional{" "}
            <span className="gradient-text">Journey</span>
          </h2>
          <p className="section-subtitle">
            1.5+ years of hands-on experience building production-grade applications.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className={styles.timeline}>
          {/* Vertical line */}
          <div className={styles.timelineLine} />

          {experience.map((exp, i) => (
            <motion.div
              key={exp.id}
              className={`${styles.item} ${i % 2 === 0 ? styles.itemLeft : styles.itemRight}`}
              initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.2 }}
            >
              {/* Timeline dot */}
              <motion.div
                className={styles.dot}
                style={{ borderColor: exp.color, boxShadow: `0 0 20px ${exp.color}50` }}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 + 0.3, type: "spring" }}
              >
                <div className={styles.dotInner} style={{ background: exp.color }} />
              </motion.div>

              {/* Card */}
              <motion.div
                className={`glass-card ${styles.card}`}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                {/* Top: role & company */}
                <div className={styles.cardTop}>
                  <div
                    className={styles.roleIcon}
                    style={{ background: `${exp.color}15`, color: exp.color, border: `1px solid ${exp.color}30` }}
                  >
                    <Briefcase size={20} />
                  </div>
                  <div className={styles.roleInfo}>
                    <div className={styles.roleTitle}>{exp.role}</div>
                    <div className={styles.company} style={{ color: exp.color }}>
                      @ {exp.company}
                    </div>
                  </div>
                  {exp.current && (
                    <span className={styles.currentBadge}>Current</span>
                  )}
                </div>

                {/* Meta */}
                <div className={styles.meta}>
                  <span className={styles.metaItem}>
                    <Calendar size={13} />
                    {exp.duration}
                  </span>
                  <span className={styles.metaItem}>
                    <MapPin size={13} />
                    {exp.type}
                  </span>
                </div>

                {/* Description */}
                <p className={styles.desc}>{exp.description}</p>

                {/* Achievements */}
                <div className={styles.achievements}>
                  {exp.achievements.map((a) => (
                    <div key={a} className={styles.achievement}>
                      <CheckCircle2 size={14} style={{ color: exp.color, flexShrink: 0 }} />
                      <span>{a}</span>
                    </div>
                  ))}
                </div>

                {/* Tech */}
                <div className={styles.tech}>
                  {exp.tech.map((t) => (
                    <span
                      key={t}
                      className={styles.techTag}
                      style={{
                        background: `${exp.color}12`,
                        color: exp.color,
                        border: `1px solid ${exp.color}25`,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
