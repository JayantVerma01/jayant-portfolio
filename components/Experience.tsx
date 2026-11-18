"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight, Download } from "lucide-react";
import { experience, personalInfo, process } from "@/lib/data";
import styles from "./Experience.module.css";

export default function Experience() {
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 65%", "end 55%"],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  return (
    <section id="experience" className={`section ${styles.experience}`}>
      <div className="container">
        <div className={styles.head}>
          <p className={styles.tag}>Experience</p>
          <h2 className={styles.title}>
            Where I&apos;ve <em>worked</em>.
          </h2>
        </div>

        <ol className={styles.list} ref={listRef}>
          <span className={styles.rail} aria-hidden="true">
            <motion.span className={styles.railFill} style={{ scaleY: fill }} />
          </span>

          {experience.map((job, i) => (
            <motion.li
              key={job.id}
              className={styles.job}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.7, delay: i === 0 ? 0 : 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className={`${styles.node} ${job.current ? styles.nodeNow : ""}`} aria-hidden="true" />

              <div className={styles.when}>
                <p className={styles.dates}>{job.duration}</p>
                <p className={styles.type}>
                  {job.current && <span className={styles.nowDot} />} {job.type}
                </p>
              </div>

              <div className={styles.body}>
                <h3 className={styles.role}>{job.role}</h3>
                <p className={styles.company}>{job.company}</p>
                <p className={styles.desc}>{job.description}</p>

                {job.achievements.length > 0 && (
                  <ul className={styles.wins}>
                    {job.achievements.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                )}

                <ul className={styles.chips} aria-label="Technologies used">
                  {job.tech.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </motion.li>
          ))}
        </ol>

        <div className={styles.cta}>
          <a className={styles.primary} href={personalInfo.resume} download>
            <Download size={16} /> Full résumé (PDF)
          </a>
          <a className={styles.ghost} href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn <ArrowUpRight size={16} />
          </a>
        </div>

        {/* Process */}
        <div className={styles.processHead}>
          <p className={styles.tag}>Process</p>
          <h3 className={styles.processTitle}>
            How I <em>work</em>.
          </h3>
        </div>

        <ol className={styles.steps}>
          {process.map((s, i) => (
            <motion.li
              key={s.title}
              className={styles.step}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className={styles.stepNo}>{String(i + 1).padStart(2, "0")}</span>
              <p className={styles.stepKicker}>{s.step}</p>
              <h4 className={styles.stepTitle}>{s.title}</h4>
              <p className={styles.stepBody}>{s.body}</p>
              <ul className={styles.stepOut} aria-label="What comes of it">
                {s.outputs.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
