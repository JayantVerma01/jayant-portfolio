"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowUpRight, Download, MapPin } from "lucide-react";
import { facts, kpis, personalInfo } from "@/lib/data";
import { useRich3D } from "@/hooks/useRich3D";
import CountUp from "./CountUp";
import styles from "./About.module.css";

function tilt(e: React.PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  el.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
  el.style.setProperty("--ry", `${(x * 12).toFixed(2)}deg`);
}
function untilt(e: React.PointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty("--rx", "0deg");
  e.currentTarget.style.setProperty("--ry", "0deg");
}

function LocalTime() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () =>
      setT(
        new Intl.DateTimeFormat("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: personalInfo.timezone,
        }).format(new Date()),
      );
    tick();
    const id = setInterval(tick, 20_000);
    return () => clearInterval(id);
  }, []);
  return <span>{t || "--:--"}</span>;
}

/**
 * Fades/blurs a piece of the About page in as the scattered ID-card tiles land.
 * `sp` runs 0 → 1; the piece is fully in by `to`.
 */
function Reveal({
  sp,
  from,
  to,
  className,
  jelly,
  children,
  as = "div",
}: {
  sp: MotionValue<number>;
  from: number;
  to: number;
  className?: string;
  jelly?: boolean;
  children: React.ReactNode;
  as?: "div" | "li" | "dl";
}) {
  const opacity = useTransform(sp, [from, to], [0, 1]);
  const y = useTransform(sp, [from, to], [36, 0]);
  const scale = useTransform(sp, [from, to], [0.88, 1]);
  const blur = useTransform(sp, [from, to], [14, 0]);
  const filter = useMotionTemplate`blur(${blur}px)`;
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      style={{ opacity, y, scale, filter }}
      data-jelly={jelly ? "" : undefined}
    >
      {children}
    </Tag>
  );
}

/** The whole About page, on a single screen. */
export function AboutPanel({ progress }: { progress?: MotionValue<number> }) {
  const full = useMotionValue(1);
  const sp = progress ?? full;

  return (
    <div className={`container ${styles.panel}`}>
      <Reveal sp={sp} from={0.05} to={0.4} className={styles.portraitCol}>
        <figure
          className={styles.portrait}
          onPointerMove={tilt}
          onPointerLeave={untilt}
          data-jelly=""
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/jayant-convocation.webp"
            alt="Jayant at his B.Tech convocation, holding his degree"
            width={800}
            height={1000}
          />
        </figure>
        <span className={`${styles.float} ${styles.f1}`}>Next.js</span>
        <span className={`${styles.float} ${styles.f2}`}>RAG</span>
        <span className={`${styles.float} ${styles.f3}`}>HG Infra</span>
        <svg className={styles.stamp} viewBox="0 0 120 120" aria-hidden="true">
          <defs>
            <path id="stampPath" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
          </defs>
          <text>
            <textPath href="#stampPath">
              full stack · ai engineer · full stack · ai engineer ·
            </textPath>
          </text>
        </svg>
      </Reveal>

      <div className={styles.details}>
        <Reveal sp={sp} from={0.15} to={0.42} className={styles.head}>
          <p className={styles.tag}>About</p>
          <h2 className={styles.title}>
            Clean APIs, solid data, and <em>interfaces people enjoy using.</em>
          </h2>
        </Reveal>

        <ul className={styles.numbers}>
          {kpis.map((k, i) => (
            <Reveal
              key={k.label}
              as="li"
              sp={sp}
              from={0.28 + i * 0.07}
              to={0.55 + i * 0.07}
              jelly
            >
              <strong>
                <CountUp value={k.value} suffix={k.suffix} />
              </strong>
              <span>{k.label}</span>
            </Reveal>
          ))}
        </ul>

        <Reveal sp={sp} from={0.5} to={0.78} className={styles.facts} as="dl" jelly>
          {facts.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </Reveal>

        <Reveal sp={sp} from={0.62} to={0.9} className={styles.now} jelly>
          <p>
            <span className={styles.live} /> {personalInfo.availability.label}
            <span className={styles.where}>
              <MapPin size={13} /> <LocalTime />
            </span>
          </p>
          <div className={styles.actions}>
            <a className={styles.primary} href={personalInfo.resume} download>
              <Download size={15} /> Résumé
            </a>
            <a className={styles.ghost} href="#contact">
              Let&apos;s talk <ArrowUpRight size={15} />
            </a>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/** Regular (non-scroll-scene) About, used on touch / small / reduced-motion devices. */
export default function About() {
  const rich = useRich3D();
  if (rich === true) return null;
  return (
    <section id="about" className={`section ${styles.about}`}>
      <AboutPanel />
    </section>
  );
}
