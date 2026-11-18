"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Check, FolderOpen, GitBranch, Mail } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { experience, navLinks, personalInfo, projects } from "@/lib/data";
import { skillGroups } from "@/lib/skills";
import { luffySay, punchAt } from "./hero/store";
import styles from "./Footer.module.css";

type Line = { id: number; kind: "cmd" | "out" | "ok" | "dim"; node: React.ReactNode };

const BUILT_WITH = ["Next.js", "React", "TypeScript", "Three.js", "Rapier", "Framer Motion"];
const CHIPS = ["help", "about", "skills", "projects", "experience", "contact", "hire"];
const BADGES: [string, string, string][] = [
  ["build", "passing", "#2b8a3e"],
  ["theme", "light", "#5b3df0"],
  ["a11y", "checked", "#0b7285"],
  ["status", "open to work", "#c2255c"],
];

export default function Footer() {
  const [first, last] = personalInfo.name.split(" ");
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const idRef = useRef(0);
  const hist = useRef<string[]>([]);
  const histI = useRef(-1);
  const termRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const topBtn = useRef<HTMLAnchorElement>(null);

  const push = (kind: Line["kind"], node: React.ReactNode) =>
    setLines((l) => [...l, { id: ++idRef.current, kind, node }]);

  // The "deploy" log types itself out the first time the footer comes into view.
  useEffect(() => {
    const el = termRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const time = new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: personalInfo.timezone,
    }).format(new Date());
    const script: [Line["kind"], React.ReactNode][] = [
      ["cmd", "npm run ship"],
      ["dim", "> next build"],
      ["ok", "Compiled successfully"],
      ["ok", `${skillGroups.length} skill decks · ${experience.length} ports · ${projects.length} projects`],
      ["ok", `Deployed to production · Jaipur · ${time}`],
      ["dim", 'Type "help", or tap a command below.'],
    ];
    const timers = script.map(([k, n], i) =>
      window.setTimeout(() => setLines((l) => [...l, { id: ++idRef.current, kind: k, node: n }]), 350 + i * 420),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [started]);

  useEffect(() => {
    const b = bodyRef.current;
    if (b) b.scrollTop = b.scrollHeight;
  }, [lines]);

  const link = (href: string, text: string) => (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={styles.tlink}>
      {text}
    </a>
  );

  function run(raw: string) {
    const cmd = raw.trim();
    if (!cmd) return;
    hist.current = [cmd, ...hist.current].slice(0, 30);
    histI.current = -1;
    const [name, ...rest] = cmd.toLowerCase().split(/\s+/);
    if (name === "clear") {
      setLines([]);
      return;
    }
    push("cmd", cmd);

    switch (name) {
      case "help":
        push("out", "help · about · skills · projects · experience · contact · hire");
        push("dim", "also: whoami · ls · top · clear");
        break;
      case "about":
      case "whoami":
        push("out", `${personalInfo.name} — ${personalInfo.role}, ${personalInfo.location.split(",")[0]}.`);
        push("dim", "Builds production web apps and AI features, from the API to the interface.");
        break;
      case "skills":
        skillGroups.forEach((g) =>
          push("out", `${g.name}: ${g.skills.slice(0, 4).map((s) => s.name).join(", ")}${g.skills.length > 4 ? " …" : ""}`),
        );
        break;
      case "projects":
        projects.slice(0, 7).forEach((p, i) => push("out", `${String(i + 1).padStart(2, "0")}  ${p.title}`));
        push("dim", `…and ${Math.max(0, projects.length - 7)} more in the Projects section.`);
        break;
      case "experience":
        experience
          .slice()
          .reverse()
          .forEach((j) => push("out", `${j.duration.match(/\d{4}/)?.[0]}  ${j.role} @ ${j.company}`));
        break;
      case "contact":
        push("out", link(`mailto:${personalInfo.email}`, personalInfo.email));
        push("out", link(personalInfo.linkedin, "linkedin.com/in/jayantverma1"));
        push("out", link(personalInfo.github, "github.com/JayantVerma01"));
        break;
      case "ls":
        push("out", navLinks.map((l) => l.label.toLowerCase() + "/").join("  "));
        break;
      case "top":
      case "cd":
        push("ok", "cd ~ …");
        window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 250);
        break;
      case "hire":
      case "sudo": {
        const ok = name === "hire" || rest.join(" ").includes("hire");
        if (!ok) {
          push("dim", "nice try.");
          break;
        }
        push("ok", name === "sudo" ? "Permission granted." : "Great choice.");
        push("out", "Drafting an email…");
        luffySay("Hired!!");
        window.setTimeout(() => {
          window.location.href = `mailto:${personalInfo.email}?subject=${encodeURIComponent("Let's work together")}`;
        }, 900);
        break;
      }
      default:
        push("dim", `command not found: ${name}. Try "help".`);
        luffySay("Hm?");
    }
  }

  return (
    <footer id="footer" className={styles.footer}>
      <div className={`container ${styles.top}`}>
        <ul className={styles.badges} aria-label="Status">
          {BADGES.map(([k, v, c]) => (
            <li key={k}>
              <span>{k}</span>
              <b style={{ background: c }}>{v}</b>
            </li>
          ))}
        </ul>

        <div className={styles.head}>
          <p className={styles.end}>That&apos;s the whole page.</p>
          <h2 className={styles.big}>
            Shipped. <em>Thanks for stopping by.</em>
          </h2>
        </div>

        <div className={styles.grid}>
          {/* ── terminal ── */}
          <div className={styles.term} ref={termRef}>
            <span className={styles.seat} data-footer-seat="" aria-hidden="true" />
            <div className={styles.bar}>
              <span className={styles.dots} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className={styles.title}>{personalInfo.name.split(" ")[0].toLowerCase()}@portfolio — zsh</span>
              <span className={styles.lang}>~</span>
            </div>

            <div className={styles.body} ref={bodyRef} data-lenis-prevent aria-live="polite">
              {lines.map((l) => (
                <p key={l.id} className={`${styles.line} ${styles[l.kind]}`}>
                  {l.kind === "cmd" && <span className={styles.ps}>jayant ~ %</span>}
                  {l.kind === "ok" && <Check size={13} className={styles.tick} />}
                  <span>{l.node}</span>
                </p>
              ))}
              <form
                className={styles.prompt}
                onSubmit={(e) => {
                  e.preventDefault();
                  run(input);
                  setInput("");
                }}
              >
                <span className={styles.ps}>jayant ~ %</span>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" && hist.current.length) {
                      e.preventDefault();
                      histI.current = Math.min(hist.current.length - 1, histI.current + 1);
                      setInput(hist.current[histI.current]);
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      histI.current = Math.max(-1, histI.current - 1);
                      setInput(histI.current < 0 ? "" : hist.current[histI.current]);
                    }
                  }}
                  spellCheck={false}
                  autoComplete="off"
                  autoCapitalize="off"
                  aria-label="Terminal command"
                  placeholder="type a command…"
                  data-luffy-perch=""
                />
              </form>
            </div>

            <div className={styles.chips} role="group" aria-label="Quick commands">
              {CHIPS.map((c) => (
                <button key={c} type="button" onClick={() => run(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* ── file tree + remotes ── */}
          <aside className={styles.side}>
            <div className={styles.card}>
              <p className={styles.cardTitle}>
                <FolderOpen size={14} /> portfolio/
              </p>
              <ul className={styles.tree}>
                {navLinks.map((l, i) => (
                  <li key={l.href}>
                    <a href={l.href} data-luffy-perch="">
                      <span className={styles.branch}>{i === navLinks.length - 1 ? "└─" : "├─"}</span>
                      {l.label.toLowerCase()}
                      <span className={styles.arrow}>↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.card}>
              <p className={styles.cardTitle}>
                <GitBranch size={14} /> git remote -v
              </p>
              <ul className={styles.remotes}>
                <li>
                  <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" data-luffy-perch="">
                    <FaGithub size={15} /> origin <span>github.com/JayantVerma01</span>
                  </a>
                </li>
                <li>
                  <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" data-luffy-perch="">
                    <FaLinkedin size={15} /> linkedin <span>/in/jayantverma1</span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${personalInfo.email}`} data-luffy-perch="">
                    <Mail size={15} /> mail <span>{personalInfo.email}</span>
                  </a>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        <div className={styles.base}>
          <p className={styles.giant} aria-hidden="true">
            {first} <em>{last}</em>
          </p>
          <div className={styles.baseRight}>
            <ul className={styles.built} aria-label="Built with">
              {BUILT_WITH.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <a ref={topBtn} className={styles.up} href="#home" data-luffy-perch="" onClick={() => punchAt(topBtn.current)}>
              <ArrowUp size={15} /> cd ~
            </a>
          </div>
          <p className={styles.copy}>
            © {new Date().getFullYear()} {personalInfo.name}. Designed and built by me.
          </p>
        </div>
      </div>
    </footer>
  );
}
