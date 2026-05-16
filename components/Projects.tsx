"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Star, Tag } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { projects } from "@/lib/data";
import styles from "./Projects.module.css";

const CATEGORIES = ["All", "E-Commerce", "EPC", "Cloud Storage", "AI / ML", "Blockchain", "Enterprise", "Social Media"];

export default function Projects() {
  const [filter, setFilter] = useState("All");
  const [hovered, setHovered] = useState<number | null>(null);

  const filtered =
    filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <section id="projects" className={`section ${styles.projects}`}>
      <div className="container">
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-tag">Projects</span>
          <h2 className="section-title">
            Things I&apos;ve{" "}
            <span className="gradient-text">Built</span>
          </h2>
          <p className="section-subtitle">
            A showcase of real-world projects built with passion for clean code and great user experience.
          </p>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          className={styles.filters}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              className={`${styles.filterBtn} ${filter === cat ? styles.filterActive : ""}`}
              onClick={() => setFilter(cat)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {cat}
            </motion.button>
          ))}
        </motion.div>

        {/* Projects grid */}
        <motion.div className={styles.grid} layout>
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                className={`${styles.card} ${project.featured ? styles.featured : ""}`}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                onHoverStart={() => setHovered(project.id)}
                onHoverEnd={() => setHovered(null)}
                whileHover={{ y: -8 }}
              >
                {/* Card top accent */}
                <div
                  className={styles.cardAccent}
                  style={{ background: `linear-gradient(135deg, ${project.color}30, transparent)` }}
                />

                {/* Featured badge */}
                {project.featured && (
                  <div className={styles.featuredBadge}>
                    <Star size={12} fill="currentColor" />
                    Featured
                  </div>
                )}

                {/* Project icon */}
                <div
                  className={styles.projectIcon}
                  style={{
                    background: `${project.color}15`,
                    border: `1px solid ${project.color}30`,
                    color: project.color,
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>
                    {project.category === "E-Commerce" && "🛒"}
                    {project.category === "AI / ML" && "🤖"}
                    {project.category === "Blockchain" && "⛓️"}
                    {project.category === "Enterprise" && "🏢"}
                    {project.category === "EPC" && "🏗️"}
                    {project.category === "Cloud Storage" && "☁️"}
                    {project.category === "Social Media" && "👥"}
                  </span>
                </div>

                {/* Category */}
                <div className={styles.categoryRow}>
                  <span className={styles.category} style={{ color: project.color }}>
                    <Tag size={11} />
                    {project.category}
                  </span>
                  <div className={styles.stats}>
                    {Object.entries(project.stats).map(([k, v]) => (
                      <span key={k} className={styles.stat}>
                        {v} {k}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Title & description */}
                <h3 className={styles.title}>{project.title}</h3>
                <p className={styles.desc}>
                  {hovered === project.id ? project.longDescription : project.description}
                </p>

                {/* Tech stack */}
                <div className={styles.techStack}>
                  {project.tech.slice(0, 4).map((t) => (
                    <span key={t} className="badge">
                      {t}
                    </span>
                  ))}
                  {project.tech.length > 4 && (
                    <span className="badge">+{project.tech.length - 4}</span>
                  )}
                </div>

                {/* Links */}
                <div className={styles.links}>
                  {/* <motion.a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.link} ${styles.linkGhost}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaGithub size={16} />
                    Code
                  </motion.a> */}
                  <motion.a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                    style={{
                      background: `${project.color}15`,
                      borderColor: `${project.color}30`,
                      color: project.color,
                    }}
                    whileHover={{ scale: 1.05, background: `${project.color}25` }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ExternalLink size={16} />
                    Link
                  </motion.a>
                </div>

                {/* Hover glow line */}
                <motion.div
                  className={styles.hoverLine}
                  style={{ background: project.color }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: hovered === project.id ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
