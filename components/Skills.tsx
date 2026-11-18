"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { projects } from "@/lib/data";
import { allSkills, skillGroups, skillsForProject } from "@/lib/skills";
import styles from "./Skills.module.css";

type Focus = { kind: "skill"; id: string } | { kind: "project"; id: number } | null;

export default function Skills() {
  const [hover, setHover] = useState<Focus>(null);
  const [pinned, setPinned] = useState<Focus>(null);
  const focus = hover ?? pinned;

  const same = (a: Focus, b: Focus) =>
    !!a && !!b && a.kind === b.kind && a.id === b.id;

  // What is lit up for the current focus.
  const { litSkills, litProjects } = useMemo(() => {
    if (!focus) return { litSkills: null, litProjects: null };
    if (focus.kind === "skill") {
      const s = allSkills.find((x) => x.name === focus.id);
      return { litSkills: new Set([focus.id]), litProjects: new Set(s?.projectIds ?? []) };
    }
    return {
      litSkills: new Set(skillsForProject(focus.id).map((s) => s.name)),
      litProjects: new Set([focus.id]),
    };
  }, [focus]);

  const summary = useMemo(() => {
    if (!focus) return "Hover or tap a skill to see where I've used it, or a project to see its stack.";
    if (focus.kind === "skill") {
      const s = allSkills.find((x) => x.name === focus.id);
      const names = (s?.projectIds ?? []).map((id) => projects.find((p) => p.id === id)?.title);
      return names.length
        ? `${focus.id}: used in ${names.join(", ")}.`
        : `${focus.id}: not tied to a listed project yet.`;
    }
    const p = projects.find((x) => x.id === focus.id);
    const n = skillsForProject(focus.id).length;
    return `${p?.title}: ${n} skills from my toolbox.`;
  }, [focus]);

  const toggle = (f: NonNullable<Focus>) => setPinned((cur) => (same(cur, f) ? null : f));

  return (
    <section id="skills" className={`section ${styles.skills}`}>
      <div className="container">
        <div className={styles.head}>
          <p className={styles.tag}>Toolbox</p>
          <h2 className={styles.title}>
            What I build with, <em>and where</em>.
          </h2>
          <p className={styles.sub}>
            No percentage bars. Pick any skill and see the projects that prove it, or pick a
            project and see its stack.
          </p>
        </div>

        {/* Projects row */}
        <div className={styles.projectRow} role="group" aria-label="Projects">
          {projects.map((p) => {
            const f: Focus = { kind: "project", id: p.id };
            const lit = litProjects?.has(p.id);
            return (
              <button
                key={p.id}
                className={`${styles.pPill} ${lit ? styles.lit : ""} ${litProjects && !lit ? styles.dim : ""}`}
                aria-pressed={same(pinned, f)}
                onMouseEnter={() => setHover(f)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(f)}
                onBlur={() => setHover(null)}
                onClick={() => toggle(f)}
                style={{ ["--c" as string]: p.color }}
              >
                <i />
                {p.title}
              </button>
            );
          })}
        </div>

        <p className={styles.summary} aria-live="polite">
          {summary}
        </p>

        {/* Skill groups */}
        <div className={styles.groups}>
          {skillGroups.map((g, gi) => (
            <motion.div
              key={g.name}
              className={styles.group}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.6, delay: (gi % 3) * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <h3 className={styles.groupTitle} style={{ ["--c" as string]: g.color }}>
                <i /> {g.name}
              </h3>
              <ul className={styles.chips}>
                {g.skills.map((s) => {
                  const f: Focus = { kind: "skill", id: s.name };
                  const lit = litSkills?.has(s.name);
                  return (
                    <li key={s.name}>
                      <button
                        className={`${styles.chip} ${lit ? styles.chipLit : ""} ${litSkills && !lit ? styles.dim : ""}`}
                        aria-pressed={same(pinned, f)}
                        onMouseEnter={() => setHover(f)}
                        onMouseLeave={() => setHover(null)}
                        onFocus={() => setHover(f)}
                        onBlur={() => setHover(null)}
                        onClick={() => toggle(f)}
                        style={{ ["--c" as string]: g.color }}
                      >
                        {s.name}
                        {s.projectIds.length > 0 && <sup>{s.projectIds.length}</sup>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
