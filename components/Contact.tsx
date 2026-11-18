"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Copy, Download, Loader2 } from "lucide-react";
import { FaGithub, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";
import { personalInfo } from "@/lib/data";
import { perchOn, punchAt } from "./hero/store";
import styles from "./Contact.module.css";

type Status = "idle" | "sending" | "success" | "error";
type Fields = "name" | "email" | "message";

const TOPICS = ["Full-time role", "Freelance project", "Just saying hi"];
const EMPTY = { name: "", email: "", message: "", website: "" };

function validate(f: typeof EMPTY) {
  const e: Partial<Record<Fields, string>> = {};
  if (!f.name.trim()) e.name = "Please tell me your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "That email doesn't look right.";
  if (f.message.trim().length < 10) e.message = "A few more words, please (10+ characters).";
  return e;
}

function useLocalTime(tz: string) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: tz,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 20_000);
    return () => clearInterval(id);
  }, [tz]);
  return time;
}

function Bottle() {
  return (
    <svg viewBox="0 0 120 200" className={styles.bottleSvg} aria-hidden="true">
      <g strokeLinejoin="round" strokeLinecap="round">
        <path d="M44 18 h32 v26 q22 14 22 40 v78 q0 22 -22 22 h-32 q-22 0 -22 -22 v-78 q0 -26 22 -40 Z" fill="#cdeaf2" fillOpacity="0.75" stroke="#17151f" strokeWidth="5" />
        <rect x="46" y="4" width="28" height="22" rx="5" fill="#c98f4a" stroke="#17151f" strokeWidth="5" />
        <path d="M44 84 q16 8 32 0" fill="none" stroke="#fff" strokeWidth="4" opacity="0.9" />
        <g transform="rotate(-8 60 120)">
          <rect x="38" y="92" width="44" height="66" rx="6" fill="#f6ecd2" stroke="#17151f" strokeWidth="4" />
          <path d="M46 110 h28 M46 122 h28 M46 134 h20" stroke="#6b7fb5" strokeWidth="3" />
          <circle cx="68" cy="146" r="7" fill="#d9372f" stroke="#17151f" strokeWidth="3" />
        </g>
        <path d="M30 100 v60" stroke="#fff" strokeWidth="5" opacity="0.7" />
      </g>
    </svg>
  );
}

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [launched, setLaunched] = useState(false);
  const [copied, setCopied] = useState(false);
  const time = useLocalTime(personalInfo.timezone);
  const letter = useRef<HTMLDivElement>(null);
  const bottle = useRef<HTMLDivElement>(null);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (k !== "website" && errors[k as Fields]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`c-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, subject: `${topic}: message from ${form.name.trim()}` }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setLaunched(false);
      setStatus("success");
      setForm(EMPTY);
    } catch {
      setStatus("error");
    }
  }

  // The message goes into a bottle, and Luffy punches it out to sea.
  useEffect(() => {
    if (status !== "success") return;
    const t1 = window.setTimeout(() => punchAt(bottle.current), 900);
    const t2 = window.setTimeout(() => setLaunched(true), 1300);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [status]);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(personalInfo.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${personalInfo.email}`;
    }
  }

  const wa = `https://wa.me/${personalInfo.whatsapp}?text=${encodeURIComponent("Hi Jayant, I found your portfolio and would like to talk.")}`;

  const signs: {
    key: string;
    label: string;
    value: React.ReactNode;
    icon: React.ReactNode;
    href?: string;
    onClick?: () => void;
    download?: boolean;
  }[] = [
    {
      key: "email",
      label: "Email",
      value: copied ? "Copied!" : personalInfo.email,
      icon: copied ? <Check size={16} /> : <Copy size={16} />,
      onClick: copyEmail,
    },
    { key: "wa", label: "WhatsApp", value: "Message me", icon: <FaWhatsapp size={16} />, href: wa },
    { key: "in", label: "LinkedIn", value: "jayantverma1", icon: <FaLinkedin size={16} />, href: personalInfo.linkedin },
    { key: "gh", label: "GitHub", value: "JayantVerma01", icon: <FaGithub size={16} />, href: personalInfo.github },
    { key: "cv", label: "Résumé", value: "Download PDF", icon: <Download size={16} />, href: personalInfo.resume, download: true },
  ];

  return (
    <section id="contact" className={`section ${styles.contact}`}>
      <div className="container">
        <div className={styles.head}>
          <p className={styles.tag}>Contact</p>
          <h2 className={styles.title}>
            Thanks for listening. <em>Your turn.</em>
          </h2>
          <p className={styles.sub}>
            Hiring for a full-stack or AI role, or have something to build? Follow a sign, or write
            me a letter and I&apos;ll reply personally.
          </p>
        </div>

        <div className={styles.layout}>
          {/* ── signpost ── */}
          <div className={styles.postCol}>
            <p className={styles.live}>
              <span className={styles.dot} />
              {personalInfo.availability.label}
              {time && <span className={styles.time}> · {time} in Jaipur</span>}
            </p>

            <div className={styles.post}>
              <span className={styles.pole} aria-hidden="true" />
              <span className={styles.cap} aria-hidden="true" />
              <span className={styles.lookout} data-contact-stand="" aria-hidden="true" />
              <ul className={styles.signs}>
                {signs.map((s, i) => {
                  const inner = (
                    <>
                      <span className={styles.nail} aria-hidden="true" />
                      <span className={styles.plankLabel}>{s.label}</span>
                      <span className={styles.plankValue}>{s.value}</span>
                      <span className={styles.plankIcon} aria-hidden="true">
                        {s.icon}
                      </span>
                    </>
                  );
                  return (
                    <li
                      key={s.key}
                      className={`${styles.sign} ${i % 2 ? styles.signL : styles.signR}`}
                      style={{ ["--i" as string]: i }}
                    >
                      <span className={styles.signShape}>
                        {s.href ? (
                          <a
                            className={styles.plank}
                            href={s.href}
                            target={s.download ? undefined : "_blank"}
                            rel="noopener noreferrer"
                            download={s.download ? true : undefined}
                            data-luffy-perch=""
                          >
                            {inner}
                          </a>
                        ) : (
                          <button type="button" className={styles.plank} onClick={s.onClick} data-luffy-perch="" data-cursor="Copy">
                            {inner}
                          </button>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <span className="sr-only" aria-live="polite">
                {copied ? "Email copied" : ""}
              </span>
            </div>
          </div>

          {/* ── the letter ── */}
          <div className={styles.letterCol}>
            <div ref={letter} className={styles.letter} data-luffy-perch="">
              <span className={styles.pin} aria-hidden="true" />
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="ok"
                    className={styles.sent}
                    role="status"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      ref={bottle}
                      className={styles.bottle}
                      initial={{ scale: 0, rotate: -40, y: 40 }}
                      animate={
                        launched
                          ? { x: [0, 260, 1500], y: [0, -150, 80], rotate: [0, 300, 980], scale: [1, 1, 0.7], opacity: [1, 1, 0] }
                          : { scale: 1, rotate: [-6, 6, -6], y: 0 }
                      }
                      transition={
                        launched
                          ? { duration: 1.7, ease: "easeIn", times: [0, 0.35, 1] }
                          : { scale: { type: "spring", stiffness: 200, damping: 12 }, rotate: { repeat: Infinity, duration: 2.4 } }
                      }
                    >
                      <Bottle />
                    </motion.div>
                    <h3>{launched ? "Message in a bottle: sent." : "Sealing your message…"}</h3>
                    <p>Thanks for reaching out. I&apos;ll reply to your email soon.</p>
                    {launched && (
                      <button className={styles.again} onClick={() => setStatus("idle")}>
                        Write another
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    className={styles.form}
                    onSubmit={submit}
                    noValidate
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    onFocus={() => perchOn(letter.current)}
                  >
                    <p className={styles.dear}>Dear Jayant,</p>

                    <fieldset className={styles.topics}>
                      <legend>I&apos;m writing about</legend>
                      {TOPICS.map((t) => (
                        <label key={t} className={topic === t ? styles.topicOn : ""}>
                          <input
                            type="radio"
                            name="topic"
                            value={t}
                            checked={topic === t}
                            onChange={() => setTopic(t)}
                          />
                          {t}
                        </label>
                      ))}
                    </fieldset>

                    <div className={styles.row}>
                      <div className={styles.field}>
                        <label htmlFor="c-name">My name is</label>
                        <input
                          id="c-name"
                          autoComplete="name"
                          value={form.name}
                          onChange={set("name")}
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? "e-name" : undefined}
                          maxLength={100}
                        />
                        {errors.name && <p id="e-name" className={styles.err}>{errors.name}</p>}
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="c-email">Reply to</label>
                        <input
                          id="c-email"
                          type="email"
                          autoComplete="email"
                          value={form.email}
                          onChange={set("email")}
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? "e-email" : undefined}
                          maxLength={200}
                        />
                        {errors.email && <p id="e-email" className={styles.err}>{errors.email}</p>}
                      </div>
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="c-message">Here&apos;s what I have in mind</label>
                      <textarea
                        id="c-message"
                        rows={5}
                        value={form.message}
                        onChange={set("message")}
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? "e-message" : undefined}
                        maxLength={5000}
                      />
                      {errors.message && <p id="e-message" className={styles.err}>{errors.message}</p>}
                    </div>

                    {/* Honeypot: hidden from people, tempting to bots */}
                    <div className={styles.hp} aria-hidden="true">
                      <label htmlFor="c-website">Website</label>
                      <input
                        id="c-website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={form.website}
                        onChange={set("website")}
                      />
                    </div>

                    {status === "error" && (
                      <p className={styles.errBox} role="alert">
                        Couldn&apos;t send that. Please try again, or email{" "}
                        <a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a> directly.
                      </p>
                    )}

                    <div className={styles.foot}>
                      <p className={styles.sign2}>
                        Yours truly,<span>you</span>
                      </p>
                      <button
                        className={styles.seal}
                        type="submit"
                        disabled={status === "sending"}
                        aria-label="Send message"
                        data-cursor="Send"
                      >
                        {status === "sending" ? (
                          <Loader2 size={26} className={styles.spin} />
                        ) : (
                          <>
                            <MdOutlineMail size={26} />
                            <span>Send</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
            <p className={styles.fine}>
              <ArrowUpRight size={14} /> It goes straight to my inbox.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
