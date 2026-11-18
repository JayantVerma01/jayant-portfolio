"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Code2 } from "lucide-react";
import { projects } from "@/lib/data";
import { useRich3D } from "@/hooks/useRich3D";
import type { Project } from "./projects/cover";
import styles from "./Projects.module.css";

const Gallery3D = dynamic(() => import("./projects/Gallery3D"), { ssr: false });

type Mode = "featured" | "all";

/** A GitHub link is only useful if it points at a repo, not a profile root. */
function repoUrl(p: Project) {
  try {
    const u = new URL(p.github);
    return u.hostname.includes("github.com") && u.pathname.split("/").filter(Boolean).length >= 2
      ? p.github
      : null;
  } catch {
    return null;
  }
}
function liveUrl(p: Project) {
  if (!p.live.startsWith("http")) return null;
  if (p.live === p.github) return null; // "live" that is just the repo
  return p.live;
}

function Cover({ p, i, total }: { p: Project; i: number; total: number }) {
  return (
    <span className={styles.cover} style={{ ["--c" as string]: p.color }}>
      <span className={styles.coverTop}>
        <span>{p.category}</span>
        <span>
          {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </span>
      <strong className={styles.coverTitle}>{p.title}</strong>
      <span className={styles.coverTech}>{p.tech.slice(0, 4).join(" · ")}</span>
    </span>
  );
}

function Detail({ p }: { p: Project }) {
  const repo = repoUrl(p);
  const live = liveUrl(p);
  return (
    <motion.article
      key={p.id}
      className={styles.detail}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.detailMain}>
        <p className={styles.kicker}>{p.category}</p>
        <h3 className={styles.detailTitle}>{p.title}</h3>
        <p className={styles.detailText}>{p.longDescription}</p>

        <ul className={styles.chips} aria-label="Tech stack">
          {p.tech.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      <div className={styles.detailSide}>
        <dl className={styles.stats}>
          <div>
            <dt>Commits</dt>
            <dd>{p.stats.commits}</dd>
          </div>
          <div>
            <dt>Features</dt>
            <dd>{p.stats.features}</dd>
          </div>
        </dl>
        <div className={styles.links}>
          {live && (
            <a className={styles.primary} href={live} target="_blank" rel="noopener noreferrer">
              Live site <ArrowUpRight size={16} />
            </a>
          )}
          {repo && (
            <a className={styles.ghost} href={repo} target="_blank" rel="noopener noreferrer">
              <Code2 size={16} /> Code
            </a>
          )}
          {!live && !repo && <p className={styles.private}>Private / internal project</p>}
        </div>
      </div>
    </motion.article>
  );
}

export default function Projects() {
  const rich = useRich3D();
  const [mode, setMode] = useState<Mode>("featured");
  const [active, setActive] = useState(0);
  const [category, setCategory] = useState("All");

  const featured = useMemo(() => projects.filter((p) => p.featured), []);
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(projects.map((p) => p.category)))],
    [],
  );
  const grid = category === "All" ? projects : projects.filter((p) => p.category === category);
  const current = featured[active];

  return (
    <section id="projects" className={`section ${styles.projects}`}>
      <div className="container">
        <div className={styles.head}>
          <div>
            <p className={styles.tag}>Selected work</p>
            <h2 className={styles.title}>
              Things I&apos;ve <em>shipped</em>.
            </h2>
          </div>

          <div className={styles.toggle} role="tablist" aria-label="Project view">
            {(["featured", "all"] as Mode[]).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                className={mode === m ? styles.toggleOn : ""}
                onClick={() => setMode(m)}
              >
                {m === "featured" ? `Featured (${featured.length})` : `All (${projects.length})`}
              </button>
            ))}
          </div>
        </div>

        {mode === "featured" ? (
          <>
            {rich === true && (
              <div className={styles.stage}>
                <Gallery3D list={featured} active={active} onChange={setActive} />
                <p className={styles.hint} aria-hidden="true">
                  drag · click a card · ← →
                </p>
              </div>
            )}

            {rich === false && (
              <div className={styles.rail} role="listbox" aria-label="Featured projects">
                {featured.map((p, i) => (
                  <button
                    key={p.id}
                    role="option"
                    aria-selected={i === active}
                    className={`${styles.railItem} ${i === active ? styles.railOn : ""}`}
                    onClick={() => setActive(i)}
                  >
                    <Cover p={p} i={i} total={featured.length} />
                  </button>
                ))}
              </div>
            )}

            <div className={styles.nav}>
              <button
                onClick={() => setActive((a) => Math.max(0, a - 1))}
                disabled={active === 0}
                aria-label="Previous project"
              >
                <ArrowLeft size={18} />
              </button>
              <span>
                {String(active + 1).padStart(2, "0")} / {String(featured.length).padStart(2, "0")}
              </span>
              <button
                onClick={() => setActive((a) => Math.min(featured.length - 1, a + 1))}
                disabled={active === featured.length - 1}
                aria-label="Next project"
              >
                <ArrowRight size={18} />
              </button>
            </div>

            <AnimatePresence mode="wait">
              <Detail key={current.id} p={current} />
            </AnimatePresence>
          </>
        ) : (
          <>
            <div className={styles.filters} role="group" aria-label="Filter by category">
              {categories.map((c) => (
                <button
                  key={c}
                  aria-pressed={category === c}
                  className={category === c ? styles.filterOn : ""}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <motion.ul layout className={styles.grid}>
              <AnimatePresence>
                {grid.map((p, i) => {
                  const live = liveUrl(p);
                  const repo = repoUrl(p);
                  const href = live ?? repo;
                  return (
                    <motion.li
                      layout
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.3 }}
                      className={styles.card}
                    >
                      <Cover p={p} i={i} total={grid.length} />
                      <p className={styles.cardText}>{p.description}</p>
                      <div className={styles.cardFoot}>
                        <span>{p.stats.commits} commits</span>
                        {href ? (
                          <a href={href} target="_blank" rel="noopener noreferrer">
                            {live ? "Live site" : "Code"} <ArrowUpRight size={14} />
                          </a>
                        ) : (
                          <span>Private</span>
                        )}
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </motion.ul>
          </>
        )}
      </div>
    </section>
  );
}
