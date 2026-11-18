"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight, Download, Gamepad2 } from "lucide-react";
import { facts, personalInfo, projects, story } from "@/lib/data";
import styles from "./About.module.css";

const beyond = projects.find((p) => p.title.startsWith("Naruto"));

export default function About() {
  const tracksRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: tracksRef,
    offset: ["start 70%", "end 60%"],
  });
  const line = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  return (
    <section id="about" className={`section ${styles.about}`}>
      <div className={`container ${styles.layout}`}>
        {/* Left: sticky intro */}
        <div className={styles.side}>
          <p className={styles.tag}>About / The story so far</p>
          <h2 className={styles.title}>
            Built in layers, <em>one shipped system</em> at a time.
          </h2>
          <p className={styles.bio}>{personalInfo.bio}</p>

          <dl className={styles.facts}>
            {facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>

          <div className={styles.actions}>
            <a className={styles.primary} href={personalInfo.resume} download>
              <Download size={16} /> Download résumé
            </a>
            <a className={styles.ghost} href="#contact">
              Let&apos;s talk <ArrowUpRight size={16} />
            </a>
          </div>
        </div>

        {/* Right: tracks */}
        <div className={styles.main}>
          <ol className={styles.tracks} ref={tracksRef}>
            <span className={styles.rail} aria-hidden="true">
              <motion.span className={styles.railFill} style={{ scaleY: line }} />
            </span>
            {story.map((t, i) => (
              <motion.li
                key={t.no}
                className={styles.track}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-12% 0px" }}
                transition={{ duration: 0.7, delay: i === 0 ? 0 : 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className={styles.no}>{t.no}</span>
                <div className={styles.body}>
                  <p className={styles.when}>{t.when}</p>
                  <h3 className={styles.trackTitle}>{t.title}</h3>
                  <p className={styles.text}>{t.body}</p>
                  <ul className={styles.chips} aria-label="Technologies">
                    {t.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                </div>
              </motion.li>
            ))}
          </ol>

          {beyond && (
            <motion.a
              className={styles.beyond}
              href={beyond.live}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.7 }}
              data-cursor="Try it"
            >
              <span className={styles.beyondIcon}>
                <Gamepad2 size={22} />
              </span>
              <span className={styles.beyondBody}>
                <span className={styles.beyondTag}>Beyond the day job</span>
                <strong>{beyond.title}</strong>
                <span>
                  A weekend experiment: your webcam tracks your hands and the browser
                  renders Rasengan and Chidori around them.
                </span>
              </span>
              <ArrowUpRight size={20} className={styles.beyondArrow} />
            </motion.a>
          )}
        </div>
      </div>
    </section>
  );
}
