"use client";

import { createRef, useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  motionValue,
  useMotionValue,
  useInView,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { projects, skills } from "@/lib/data";
import { skillGroups, allSkills } from "@/lib/skills";
import { useRich3D } from "@/hooks/useRich3D";
import { deck, luffySay, perchOn } from "./hero/store";
import styles from "./Skills.module.css";

const N = skillGroups.length;
const DEAL_FROM = 0.03;
const DEAL_STEP = 0.045;
const DEAL_LEN = 0.16;
const FOCUS_FROM = 0.44;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (v: number) => v * v * (3 - 2 * v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function useSummary(focus: string | null) {
  return useMemo(() => {
    if (!focus) return "Hover or tap a skill to see where I've used it.";
    const s = allSkills.find((x) => x.name === focus);
    const names = (s?.projectIds ?? []).map((id) => projects.find((p) => p.id === id)?.title);
    return names.length
      ? `${focus}: used in ${names.join(", ")}.`
      : `${focus}: part of my toolbox, not tied to a listed project yet.`;
  }, [focus]);
}

type Kind = "ts" | "py" | "yaml" | "json";
const META: Record<string, { file: string; lang: string; kind: Kind; ident: string }> = {
  Backend: { file: "backend.ts", lang: "TS", kind: "ts", ident: "backend" },
  Frontend: { file: "frontend.tsx", lang: "TSX", kind: "ts", ident: "frontend" },
  "AI / GenAI": { file: "genai.py", lang: "PY", kind: "py", ident: "genai" },
  Languages: { file: "languages.json", lang: "JSON", kind: "json", ident: "languages" },
  Databases: { file: "databases.yml", lang: "YAML", kind: "yaml", ident: "databases" },
  "Cloud / DevOps": { file: "infra.yml", lang: "YAML", kind: "yaml", ident: "infra" },
  Integrations: { file: "integrations.ts", lang: "TS", kind: "ts", ident: "integrations" },
};

const kw = (t: string) => <span className={styles.k}>{t}</span>;
const id = (t: string) => <span className={styles.i}>{t}</span>;
const pu = (t: string) => <span className={styles.p}>{t}</span>;

/** The front of a skill card: a tiny code editor window listing the stack as code. */
function CardFront({
  index,
  onFocus,
}: {
  index: number;
  onFocus: (name: string | null) => void;
}) {
  const g = skillGroups[index];
  const icon = skills[index]?.icon ?? "✦";
  const slug = g.name.toLowerCase().replace(/[^a-z]+/g, "");
  const m = META[g.name] ?? { file: `${slug}.ts`, lang: "TS", kind: "ts" as Kind, ident: slug };
  const cm = m.kind === "ts" ? "//" : "#";

  const head: React.ReactNode[] =
    m.kind === "ts"
      ? [<>{kw("export const")} {id(m.ident)} {pu("= [")}</>]
      : m.kind === "py"
        ? [<>{id(m.ident)} {pu("= [")}</>]
        : m.kind === "json"
          ? [pu("{"), <>{"  "}{pu('"')}{id(m.ident)}{pu('": [')}</>]
          : [<>{id(m.ident)}{pu(":")}</>];
  const tail: React.ReactNode[] =
    m.kind === "ts" ? [pu("];")] : m.kind === "py" ? [pu("]")] : m.kind === "json" ? [<>{"  "}{pu("]")}</>, pu("}")] : [];
  const pad = m.kind === "json" ? "    " : m.kind === "yaml" ? "  " : "  ";

  let n = 0;
  return (
    <div className={styles.front} style={{ ["--c" as string]: g.color }}>
      <div className={styles.bar}>
        <span className={styles.dots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className={styles.tab}>
          <span aria-hidden="true">{icon}</span> {m.file}
        </span>
        <span className={styles.lang}>{m.lang}</span>
      </div>

      <ol className={styles.code}>
        {head.map((h, i) => (
          <li key={`h${i}`}>
            <span className={styles.ln}>{++n}</span>
            <span className={styles.src}>{h}</span>
          </li>
        ))}
        {g.skills.map((sk, i) => (
          <li key={sk.name}>
            <span className={styles.ln}>{++n}</span>
            <button
              type="button"
              className={styles.line}
              onMouseEnter={() => onFocus(sk.name)}
              onMouseLeave={() => onFocus(null)}
              onFocus={() => onFocus(sk.name)}
              onBlur={() => onFocus(null)}
            >
              {pad}
              {m.kind === "yaml" ? (
                <>
                  {pu("- ")}
                  <span className={styles.s}>{sk.name}</span>
                </>
              ) : (
                <>
                  <span className={styles.s}>{`"${sk.name}"`}</span>
                  {pu(i < g.skills.length - 1 ? "," : "")}
                </>
              )}
              {sk.projectIds.length > 0 && m.kind !== "json" && (
                <span className={styles.c}>{` ${cm} ×${sk.projectIds.length}`}</span>
              )}
            </button>
          </li>
        ))}
        {tail.map((t, i) => (
          <li key={`t${i}`}>
            <span className={styles.ln}>{++n}</span>
            <span className={styles.src}>{t}</span>
          </li>
        ))}
      </ol>

      <div className={styles.status}>
        <span>⎇ main</span>
        <span>{g.skills.length} skills</span>
        <span>
          {String(index + 1).padStart(2, "0")}/{String(N).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

function CardBack() {
  return (
    <div className={styles.back}>
      <div className={styles.backGrid} />
      <span className={styles.braces}>{"</>"}</span>
      <span className={styles.backTag}>jayant.dev</span>
    </div>
  );
}

/** One card of the deck. Everything is scrubbed by scroll progress. */
function DeckCard({
  i,
  progress,
  width,
  active,
  onFocus,
}: {
  i: number;
  progress: MotionValue<number>;
  width: MotionValue<number>;
  active: number;
  onFocus: (name: string | null) => void;
}) {
  const c = (N - 1) / 2;
  const cw = useTransform(width, (w) => Math.min(300, Math.max(230, w * 0.21)));
  const ch = useTransform(cw, (v) => v * 1.36);

  const transform = useTransform([progress, width, cw] as MotionValue<number>[], (latest: number[]) => {
    const [v, w, cwv] = latest;
    const step = Math.min(cwv * 0.8, (w - cwv - 56) / (N - 1));
    const sx = (i - c) * step;
    const sy = Math.pow(Math.abs(i - c), 2) * 7;
    const sr = (i - c) * 3.4;
    const px = 0;
    const py = -i * 1.6;
    const pr = (((i * 37) % 7) - 3) * 1.1;
    const t = ease(clamp01((v - DEAL_FROM - i * DEAL_STEP) / DEAL_LEN));
    const arc = -Math.sin(Math.PI * t) * 80;
    return `translate(-50%, -50%) translate3d(${lerp(px, sx, t).toFixed(1)}px, ${(lerp(py, sy, t) + arc).toFixed(1)}px, 0) rotate(${lerp(pr, sr, t).toFixed(2)}deg)`;
  });
  const flip = useTransform(progress, (v) => {
    const t = clamp01((v - DEAL_FROM - i * DEAL_STEP) / DEAL_LEN);
    return 180 * (1 - ease(clamp01((t - 0.25) / 0.6)));
  });

  const isActive = active === i;
  return (
    <motion.div
      className={styles.slot}
      style={{ transform, width: cw, height: ch, zIndex: isActive ? 40 : i }}
    >
      <div
        data-deck-card={i}
        className={`${styles.lift} ${isActive ? styles.active : ""} ${active >= 0 && !isActive ? styles.rest : ""}`}
      >
        <motion.div className={styles.flip} style={{ rotateY: flip }}>
          <div className={styles.face}>
            <CardFront index={i} onFocus={onFocus} />
          </div>
          <div className={`${styles.face} ${styles.faceBack}`}>
            <CardBack />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function DeckScene() {
  const section = useRef<HTMLElement>(null);
  const table = useRef<HTMLDivElement>(null);
  const width = useMotionValue(1200);
  const [active, setActive] = useState(-1);
  const [focus, setFocus] = useState<string | null>(null);
  const summary = useSummary(focus);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const f = (v - FOCUS_FROM) / (1 - FOCUS_FROM);
    const a = f < 0 ? -1 : Math.min(N - 1, Math.floor(f * N));
    setActive((s) => (s === a ? s : a));
    deck.active.set(a);
  });

  // Luffy rides along until the whole section has scrolled away.
  const { scrollYProgress: leaving } = useScroll({
    target: section,
    offset: ["end end", "end start"],
  });
  useMotionValueEvent(leaving, "change", (v) => deck.leave.set(v));
  useEffect(() => {
    deck.active.set(-1);
    deck.leave.set(0);
    return () => deck.leave.set(1);
  }, []);

  useEffect(() => {
    const el = table.current;
    if (!el) return;
    width.set(el.clientWidth);
    const ro = new ResizeObserver(() => width.set(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  const headOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);
  const headY = useTransform(scrollYProgress, [0, 0.05], [24, 0]);

  return (
    <section id="skills" ref={section} className={styles.scene}>
      <div className={styles.sticky}>
        <motion.header className={`container ${styles.head}`} style={{ opacity: headOpacity, y: headY }}>
          <p className={styles.tag}>Toolbox</p>
          <h2 className={styles.title}>
            Dealt from my deck, <em>one stack at a time.</em>
          </h2>
        </motion.header>

        <div ref={table} className={styles.table}>
          {skillGroups.map((_, i) => (
            <DeckCard
              key={i}
              i={i}
              progress={scrollYProgress}
              width={width}
              active={active}
              onFocus={setFocus}
            />
          ))}
        </div>

        <div className={styles.summary} aria-live="polite">
          <span className={styles.sumTag}>where I used it</span>
          <span className={styles.sumText}>{summary}</span>
        </div>
      </div>
    </section>
  );
}

/** Touch / small screens: a plain grid of the same cards. */
/** Phones: the deck stacks up as you scroll. Each new card slides over the last, and Luffy leaps onto it. */
function StackCard({
  i,
  cardRef: ref,
  cover,
  onFocus,
}: {
  i: number;
  cardRef: React.RefObject<HTMLDivElement | null>;
  cover: MotionValue<number>;
  onFocus: (v: string | null) => void;
}) {
  const scale = useTransform(cover, [0, 1], [1, 0.93]);
  const dim = useTransform(cover, [0, 1], [1, 0.8]);
  // Luffy hops onto the card as it slides in
  const inView = useInView(ref, { margin: "0px 0px -42% 0px", once: true });
  useEffect(() => {
    if (!inView) return;
    perchOn(ref.current);
    luffySay(i === 0 ? "Dealing cards!" : `${skillGroups[i].skills.length} skills!`);
  }, [inView, i, ref]);
  return (
    <motion.div
      ref={ref}
      className={styles.gridCard}
      style={{ scale, opacity: dim, top: `${96 + i * 9}px`, zIndex: i + 1 }}
      initial={{ opacity: 0, x: i % 2 ? 46 : -46, rotate: i % 2 ? 5 : -5 }}
      whileInView={{ opacity: 1, x: 0, rotate: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ type: "spring", stiffness: 140, damping: 18 }}
    >
      <div className={styles.face}>
        <CardFront index={i} onFocus={onFocus} />
      </div>
    </motion.div>
  );
}

function DeckGrid() {
  const [focus, setFocus] = useState<string | null>(null);
  const summary = useSummary(focus);
  const refs = useMemo(() => skillGroups.map(() => createRef<HTMLDivElement>()), []);
  // how far the next card has slid over each card (0 = not yet, 1 = fully covering)
  const covers = useMemo(() => skillGroups.map(() => motionValue(0)), []);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", () => {
    for (let i = 0; i < refs.length - 1; i++) {
      const n = refs[i + 1].current;
      if (!n) continue;
      const rest = 96 + (i + 1) * 9;
      covers[i].set(clamp01(1 - (n.getBoundingClientRect().top - rest) / 380));
    }
  });
  return (
    <section id="skills" className={`section ${styles.gridSection}`}>
      <div className="container">
        <header className={styles.gridHead}>
          <p className={styles.tag}>Toolbox</p>
          <h2 className={styles.title}>
            Dealt from my deck, <em>one stack at a time.</em>
          </h2>
        </header>
        <p className={styles.summaryStatic}>{summary}</p>
        <div className={styles.grid}>
          {skillGroups.map((_, i) => (
            <StackCard key={i} i={i} cardRef={refs[i]} cover={covers[i]} onFocus={setFocus} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Skills() {
  const rich = useRich3D();
  return rich === true ? <DeckScene /> : <DeckGrid />;
}
