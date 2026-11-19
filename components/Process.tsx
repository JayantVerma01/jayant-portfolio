"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { Ear, Hammer, Rocket, Ruler } from "lucide-react";
import { process } from "@/lib/data";
import { useRich3D } from "@/hooks/useRich3D";
import styles from "./Process.module.css";

const ICONS = [Ear, Ruler, Hammer, Rocket];
const HANDLES = Array.from({ length: 8 }, (_, i) => i * 45);
const N = process.length;
const RUN = 360; // svh of scroll the wheel needs

function Wheel({ rotate }: { rotate: ReturnType<typeof useTransform<number, number>> }) {
  return (
    <motion.div className={styles.wheel} style={{ rotate }} aria-hidden="true">
      <svg viewBox="-100 -100 200 200" className={styles.wheelSvg}>
        <g strokeLinejoin="round" strokeLinecap="round">
          {HANDLES.map((a) => (
            <g key={a} transform={`rotate(${a})`}>
              <line x1="0" y1="0" x2="0" y2="-88" stroke="#14110f" strokeWidth="11" />
              <line x1="0" y1="0" x2="0" y2="-88" stroke="#c98f4a" strokeWidth="6" />
            </g>
          ))}
          <circle r="66" fill="none" stroke="#14110f" strokeWidth="19" />
          <circle r="66" fill="none" stroke="#d9a35c" strokeWidth="13" />
          <circle r="66" fill="none" stroke="#f0c98a" strokeWidth="3" strokeDasharray="4 10" />
          <circle r="22" fill="#f4c542" stroke="#14110f" strokeWidth="4" />
          <path d="M0 -13 L4 -4 L13 0 L4 4 L0 13 L-4 4 L-13 0 L-4 -4 Z" fill="#14110f" />
        </g>
      </svg>
      {HANDLES.map((a) => (
        <span
          key={a}
          className={styles.handle}
          data-proc-handle=""
          style={{
            left: `${50 + 45.5 * Math.sin((a * Math.PI) / 180)}%`,
            top: `${50 - 45.5 * Math.cos((a * Math.PI) / 180)}%`,
            transform: `translate(-50%, -50%) rotate(${a}deg)`,
          }}
        />
      ))}
    </motion.div>
  );
}

function StepPanel({ i, onPick }: { i: number; onPick: (n: number) => void }) {
  const s = process[i];
  const Icon = ICONS[i] ?? Hammer;
  return (
    <div className={styles.panelWrap}>
      <AnimatePresence mode="wait">
        <motion.article
          key={i}
          className={styles.panel}
          initial={{ opacity: 0, x: 60, rotate: 2 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          exit={{ opacity: 0, x: -50, rotate: -2 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          data-luffy-perch=""
        >
          <span className={styles.bigNo} aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className={styles.icon}>
            <Icon size={26} />
          </div>
          <p className={styles.kicker}>{s.step}</p>
          <h3 className={styles.stepTitle}>{s.title}</h3>
          <p className={styles.body}>{s.body}</p>
          <ul className={styles.outs} aria-label="What comes of it">
            {s.outputs.map((o, k) => (
              <motion.li
                key={o}
                initial={{ opacity: 0, scale: 0.6, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.25 + k * 0.08, type: "spring", stiffness: 260, damping: 16 }}
              >
                {o}
              </motion.li>
            ))}
          </ul>
        </motion.article>
      </AnimatePresence>

      <ol className={styles.pins} aria-label="Steps">
        {process.map((p, k) => (
          <li key={p.title}>
            <button
              type="button"
              className={`${styles.pin} ${k === i ? styles.pinOn : ""}`}
              onClick={() => onPick(k)}
              aria-label={`Go to step ${k + 1}: ${p.title}`}
              aria-current={k === i}
            >
              {String(k + 1).padStart(2, "0")}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Scene() {
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const a = Math.min(N - 1, Math.max(0, Math.floor(v * N)));
    setActive((s) => (s === a ? s : a));
  });

  const pick = (k: number) => {
    const el = section.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const run = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + run * ((k + 0.5) / N), behavior: "smooth" });
  };

  return (
    <section
      id="process"
      ref={section}
      className={styles.scene}
      style={{ height: `calc(100svh + ${RUN}svh)` }}
    >
      <div className={styles.sticky}>
        <header className={`container ${styles.head}`}>
          <p className={styles.tag}>Process</p>
          <h2 className={styles.title}>
            How I <em>work</em>.
          </h2>
        </header>

        <div className={`container ${styles.stage}`}>
          <div className={styles.helm}>
            <div className={styles.wheelWrap}>
              <Wheel rotate={rotate} />
              <span className={styles.needle} aria-hidden="true" />
              {process.map((p, k) => {
                const a = (k * 90 * Math.PI) / 180;
                return (
                  <span
                    key={p.title}
                    className={`${styles.chip} ${k === active ? styles.chipOn : ""}`}
                    style={{
                      left: `${50 + 66 * Math.sin(a)}%`,
                      top: `${50 - 66 * Math.cos(a)}%`,
                    }}
                    aria-hidden="true"
                  >
                    {p.step}
                  </span>
                );
              })}
              <span className={styles.stand} data-proc-stand="" aria-hidden="true" />
            </div>
          </div>

          <StepPanel i={active} onPick={pick} />
        </div>
      </div>
    </section>
  );
}

/** Phones: the four steps along a sea route; a little ship's wheel sails down it as you scroll. */
function Stack() {
  const ol = useRef<HTMLOListElement>(null);
  const [reached, setReached] = useState(0);
  const { scrollYProgress } = useScroll({ target: ol, offset: ["start 62%", "end 70%"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 540]);
  const top = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const grow = useTransform(scrollYProgress, [0, 1], [0, 1]);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const n = Math.min(N, Math.max(0, Math.round(v * (N - 1)) + 1));
    setReached((r) => (r === n ? r : n));
  });
  return (
    <section id="process" className={`section ${styles.stackSection}`}>
      <div className="container">
        <p className={styles.tag}>Process</p>
        <h2 className={styles.title}>
          How I <em>work</em>.
        </h2>
        <p className={styles.routeSub}>Follow the wheel. Four stops from brief to launch.</p>
        <ol className={styles.stack} ref={ol}>
          <span className={styles.routeLine} aria-hidden="true" />
          <motion.span className={styles.routeFill} style={{ scaleY: grow }} aria-hidden="true" />
          <motion.span className={styles.sailor} style={{ top }} aria-hidden="true">
            <Wheel rotate={rotate} />
          </motion.span>
          {process.map((s, i) => {
            const Icon = ICONS[i] ?? Hammer;
            return (
              <motion.li
                key={s.title}
                className={styles.panel}
                data-luffy-perch=""
                initial={{ opacity: 0, x: 40, rotate: 2 }}
                whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{ type: "spring", stiffness: 140, damping: 18 }}
              >
                <span className={`${styles.buoy} ${i < reached ? styles.buoyOn : ""}`} aria-hidden="true">
                  {i + 1}
                </span>
                <span className={styles.bigNo} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className={styles.icon}>
                  <Icon size={24} />
                </div>
                <p className={styles.kicker}>{s.step}</p>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.body}>{s.body}</p>
                <ul className={styles.outs}>
                  {s.outputs.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export default function Process() {
  const rich = useRich3D();
  return rich === true ? <Scene /> : <Stack />;
}
