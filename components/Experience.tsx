"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight, Download } from "lucide-react";
import { experience, personalInfo } from "@/lib/data";
import { perchOn } from "./hero/store";
import styles from "./Experience.module.css";

type Job = (typeof experience)[number];

/** A different portrait per poster (none of them is the ID-card photo). */
const PHOTOS: Record<number, string> = {
  1: "/images/exp-hg.webp",
  2: "/images/exp-hornet.webp",
  3: "/images/exp-fixl.webp",
};

function Island({ color, letter, chest = false }: { color: string; letter?: string; chest?: boolean }) {
  return (
    <div className={styles.island}>
      <svg viewBox="0 0 240 170" aria-hidden="true">
        <ellipse cx="120" cy="150" rx="108" ry="15" fill="#cdeaf2" stroke="#17151f" strokeWidth="3" />
        <path d="M60 150 Q120 158 180 150" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        <path d="M20 142 Q40 96 120 92 Q200 96 220 142 Q120 166 20 142 Z" fill="#efdcaa" stroke="#17151f" strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M50 114 Q120 80 190 114 Q120 128 50 114 Z" fill="#8fd09a" stroke="#17151f" strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M70 132 q8 -4 14 0 M150 136 q10 -5 18 0" fill="none" stroke="#c9b27a" strokeWidth="3" strokeLinecap="round" />
        {chest ? (
          <g strokeLinejoin="round" strokeLinecap="round">
            <path d="M84 100 L84 76 Q120 56 156 76 L156 100 Z" fill="#c98b3c" stroke="#17151f" strokeWidth="3.5" />
            <path d="M84 100 L156 100 L156 112 L84 112 Z" fill="#a8702a" stroke="#17151f" strokeWidth="3.5" />
            <path d="M84 84 Q120 66 156 84" fill="none" stroke="#17151f" strokeWidth="3" />
            <rect x="112" y="86" width="16" height="16" rx="3" fill="#f4c542" stroke="#17151f" strokeWidth="3" />
            <path d="M104 62 l4 -10 M120 56 l0 -12 M136 62 l-4 -10" stroke="#f4c542" strokeWidth="3.5" />
          </g>
        ) : (
          <g strokeLinejoin="round" strokeLinecap="round">
            {/* palm */}
            <path d="M150 108 Q160 72 146 38" fill="none" stroke="#17151f" strokeWidth="11" />
            <path d="M150 108 Q160 72 146 38" fill="none" stroke="#9a6a3c" strokeWidth="6" />
            <path d="M146 38 Q122 14 92 32 Q124 26 146 38 Z" fill="#43b05f" stroke="#17151f" strokeWidth="3" />
            <path d="M146 38 Q168 10 200 28 Q168 24 146 38 Z" fill="#43b05f" stroke="#17151f" strokeWidth="3" />
            <path d="M146 38 Q132 8 150 -2 Q146 22 146 38 Z" fill="#59c473" stroke="#17151f" strokeWidth="3" />
            <path d="M146 38 Q110 40 100 66 Q126 48 146 38 Z" fill="#43b05f" stroke="#17151f" strokeWidth="3" />
            <path d="M146 38 Q182 40 192 66 Q166 48 146 38 Z" fill="#43b05f" stroke="#17151f" strokeWidth="3" />
            {/* flag */}
            <path d="M84 108 L84 42" stroke="#17151f" strokeWidth="5" />
            <path d="M86 42 L130 44 Q122 56 130 68 L86 66 Z" fill={color} stroke="#17151f" strokeWidth="3.5" />
            <text x="106" y="62" textAnchor="middle" fontSize="17" fontWeight="800" fill="#fff" fontFamily="var(--font-sans), sans-serif">
              {letter}
            </text>
          </g>
        )}
      </svg>
      {/* where Luffy stands */}
      <span className={styles.landing} data-exp-stop="" aria-hidden="true" />
    </div>
  );
}

function Poster({ job, index }: { job: Job; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const skills = job.tech.slice(0, 5);
  const more = job.tech.length - skills.length;

  const move = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 9).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 11).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${((x + 0.5) * 100).toFixed(0)}%`);
    el.style.setProperty("--my", `${((y + 0.5) * 100).toFixed(0)}%`);
  };
  const leave = (e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };
  const toggle = () => {
    setFlipped((f) => !f);
    window.setTimeout(() => perchOn(ref.current), 250); // Luffy has a look at the case file
  };

  return (
    <motion.div
      ref={ref}
      className={styles.posterWrap}
      data-luffy-perch=""
      data-exp-poster=""
      initial={{ opacity: 0, x: index % 2 ? 80 : -80, rotate: index % 2 ? 6 : -6 }}
      whileInView={{ opacity: 1, x: 0, rotate: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className={`${styles.poster} ${flipped ? styles.flipped : ""}`}
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={`${job.role} at ${job.company}. Press to ${flipped ? "close" : "open"} the case file`}
        onPointerMove={move}
        onPointerLeave={leave}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        style={{ ["--c" as string]: job.color }}
        data-cursor={flipped ? "Close" : "Open"}
      >
        <div className={styles.flip}>
          {/* front: the wanted poster */}
          <div className={`${styles.face} ${styles.front}`}>
            <span className={styles.nail} aria-hidden="true" />
            <p className={styles.wanted}>Wanted</p>
            <p className={styles.wantedSub}>for shipping production code</p>
            <div className={styles.photo}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={PHOTOS[job.id] ?? "/images/exp-hg.webp"} alt="" width={400} height={500} loading="lazy" />
            </div>
            <span className={`${styles.stamp} ${job.current ? styles.stampNow : styles.stampDone}`}>
              {job.current ? "Current" : "Done"}
            </span>
            <h3 className={styles.role}>{job.role}</h3>
            <p className={styles.company}>{job.company}</p>
            <div className={styles.bounty}>
              <p className={styles.bountyTag}>★ Bounty: skills ★</p>
              <ul className={styles.bountyChips}>
                {skills.map((t) => (
                  <li key={t}>{t}</li>
                ))}
                {more > 0 && <li className={styles.more}>+{more}</li>}
              </ul>
            </div>
            <p className={styles.dates}>
              {job.current && <i className={styles.nowDot} />} {job.duration} · {job.type}
            </p>
            <p className={styles.hint}>click to open the case file</p>
            <span className={styles.shine} aria-hidden="true" />
          </div>

          {/* back: the case file */}
          <div className={`${styles.face} ${styles.back}`}>
            <p className={styles.caseTag}>Case file / {String(index + 1).padStart(2, "0")}</p>
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
            <p className={styles.hint}>click to flip back</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** The winding sea route that links the islands and is drawn as you scroll. */
function Route({ wrap }: { wrap: React.RefObject<HTMLDivElement | null> }) {
  const [d, setD] = useState("");
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start 60%", "end 55%"] });
  const draw = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.6 });

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const build = () => {
      const box = el.getBoundingClientRect();
      const pts = Array.from(el.querySelectorAll("[data-exp-stop]")).map((n) => {
        const r = n.getBoundingClientRect();
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + 6 };
      });
      if (pts.length < 2 || window.innerWidth < 900) {
        setD("");
        return;
      }
      let path = `M${pts[0].x.toFixed(0)} ${(pts[0].y - 70).toFixed(0)} L${pts[0].x.toFixed(0)} ${pts[0].y.toFixed(0)}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const s = i % 2 === 0 ? 1 : -1;
        const dy = b.y - a.y;
        path += ` C${(a.x + s * 220).toFixed(0)} ${(a.y + dy * 0.3).toFixed(0)} ${(b.x - s * 220).toFixed(0)} ${(b.y - dy * 0.3).toFixed(0)} ${b.x.toFixed(0)} ${b.y.toFixed(0)}`;
      }
      setD(path);
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    window.addEventListener("resize", build);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", build);
    };
  }, [wrap]);

  if (!d) return null;
  return (
    <svg className={styles.route} aria-hidden="true">
      <path d={d} className={styles.routeBase} />
      <motion.path d={d} className={styles.routeDone} style={{ pathLength: draw }} />
    </svg>
  );
}

export default function Experience() {
  const wrap = useRef<HTMLDivElement>(null);
  const voyage = experience; // current role first, then the earlier ones

  return (
    <section id="experience" className={`section ${styles.experience}`}>
      <div className={`container ${styles.top}`}>
        <div className={styles.head}>
          <p className={styles.tag}>Experience / the voyage log</p>
          <h2 className={styles.title}>
            Three ports, <em>one course.</em>
          </h2>
          <p className={styles.sub}>Follow the route. Open a poster for the full case file.</p>
        </div>

        <div className={styles.voyage} ref={wrap}>
          <Route wrap={wrap} />

          {voyage.map((job, i) => (
            <div key={job.id} data-exp-row="" className={`${styles.stop} ${i % 2 ? styles.right : styles.left}`}>
              <div className={styles.cell}>
                <Poster job={job} index={i} />
              </div>

              <motion.div
                className={styles.islandCell}
                initial={{ opacity: 0, scale: 0.5, y: 40 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ type: "spring", stiffness: 160, damping: 14 }}
              >
                <Island color={job.color} letter={job.company.trim()[0]} />
                <p className={styles.port}>{job.company}</p>
              </motion.div>

              <div className={`${styles.cell} ${styles.year}`} aria-hidden="true">
                <span>{job.duration.match(/\d{4}/)?.[0]}</span>
              </div>
            </div>
          ))}

          {/* the treasure at the end of the route */}
          <div data-exp-row="" className={`${styles.stop} ${styles.final}`}>
            <div className={styles.cell} />
            <motion.div
              className={styles.islandCell}
              initial={{ opacity: 0, scale: 0.5, y: 40 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ type: "spring", stiffness: 160, damping: 14 }}
            >
              <Island color="#f4c542" chest />
              <p className={styles.port}>Next port: your team?</p>
              <div className={styles.cta}>
                <a className={styles.primary} href={personalInfo.resume} download>
                  <Download size={16} /> Full résumé
                </a>
                <a className={styles.ghost} href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn <ArrowUpRight size={16} />
                </a>
              </div>
            </motion.div>
            <div className={styles.cell} />
          </div>
        </div>

      </div>
    </section>
  );
}
