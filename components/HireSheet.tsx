"use client";

import { useEffect, useRef } from "react";
import { Download, Mail, X } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { kpis, personalInfo } from "@/lib/data";
import styles from "./HireSheet.module.css";

const STACK = [
  "Next.js",
  "React",
  "Node.js",
  "TypeScript",
  "Python / FastAPI",
  "LangChain / RAG",
  "MongoDB",
  "Docker",
];

/** 20-second recruiter summary. Native <dialog> gives focus trap + Esc for free. */
export default function HireSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.sheet}
      data-lenis-prevent
      aria-labelledby="hire-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose(); // backdrop click
      }}
    >
      <div className={styles.body}>
        <button className={styles.close} onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <p className={styles.eyebrow}>
          <span className={styles.dot} /> {personalInfo.availability.label} ·{" "}
          {personalInfo.location.split(",")[0]}
        </p>
        <h2 id="hire-title" className={styles.title}>
          {personalInfo.name}
          <em> — {personalInfo.role}</em>
        </h2>
        <p className={styles.lead}>
          Builds production web apps and AI features end to end: APIs, data,
          integrations and the interface on top.
        </p>

        <ul className={styles.kpis}>
          {kpis.map((k) => (
            <li key={k.label}>
              <strong>
                {k.value}
                {k.suffix}
              </strong>
              <span>{k.label}</span>
            </li>
          ))}
        </ul>

        <ul className={styles.chips} aria-label="Core stack">
          {STACK.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>

        <div className={styles.actions}>
          <a className={styles.primary} href={personalInfo.resume} download>
            <Download size={16} /> Resume
          </a>
          <a className={styles.ghost} href={`mailto:${personalInfo.email}`}>
            <Mail size={16} /> Email
          </a>
          <a
            className={styles.ghost}
            href={personalInfo.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin size={16} /> LinkedIn
          </a>
          <a
            className={styles.ghost}
            href={personalInfo.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub size={16} /> GitHub
          </a>
        </div>
      </div>
    </dialog>
  );
}
