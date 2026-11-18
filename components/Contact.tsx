"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Copy, Download, Loader2, Send } from "lucide-react";
import { FaGithub, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { personalInfo } from "@/lib/data";
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

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [copied, setCopied] = useState(false);
  const time = useLocalTime(personalInfo.timezone);

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
      setStatus("success");
      setForm(EMPTY);
    } catch {
      setStatus("error");
    }
  }

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

  return (
    <section id="contact" className={`section ${styles.contact}`}>
      <div className="container">
        <div className={styles.head}>
          <p className={styles.tag}>Contact</p>
          <h2 className={styles.title}>
            Thanks for listening. <em>Your turn.</em>
          </h2>
          <p className={styles.sub}>
            Hiring for a full-stack or AI role, or have something to build? Tell me a little and
            I&apos;ll reply personally.
          </p>
        </div>

        <div className={styles.grid}>
          {/* Direct channels */}
          <div className={styles.side}>
            <p className={styles.live}>
              <span className={styles.dot} />
              {personalInfo.availability.label}
              {time && <span className={styles.time}> · {time} in Jaipur</span>}
            </p>

            <ul className={styles.channels}>
              <li>
                <button className={styles.channel} onClick={copyEmail} data-cursor="Copy">
                  <span className={styles.chLabel}>Email</span>
                  <span className={styles.chValue}>{personalInfo.email}</span>
                  <span className={styles.chIcon} aria-hidden="true">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </span>
                </button>
                <span className="sr-only" aria-live="polite">
                  {copied ? "Email copied" : ""}
                </span>
              </li>
              <li>
                <a className={styles.channel} href={wa} target="_blank" rel="noopener noreferrer">
                  <span className={styles.chLabel}>WhatsApp</span>
                  <span className={styles.chValue}>
                    <FaWhatsapp size={15} /> Message me
                  </span>
                  <ArrowUpRight size={16} className={styles.chIcon} />
                </a>
              </li>
              <li>
                <a className={styles.channel} href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer">
                  <span className={styles.chLabel}>LinkedIn</span>
                  <span className={styles.chValue}>
                    <FaLinkedin size={15} /> jayantverma1
                  </span>
                  <ArrowUpRight size={16} className={styles.chIcon} />
                </a>
              </li>
              <li>
                <a className={styles.channel} href={personalInfo.github} target="_blank" rel="noopener noreferrer">
                  <span className={styles.chLabel}>GitHub</span>
                  <span className={styles.chValue}>
                    <FaGithub size={15} /> JayantVerma01
                  </span>
                  <ArrowUpRight size={16} className={styles.chIcon} />
                </a>
              </li>
              <li>
                <a className={styles.channel} href={personalInfo.resume} download>
                  <span className={styles.chLabel}>Résumé</span>
                  <span className={styles.chValue}>Download PDF</span>
                  <Download size={16} className={styles.chIcon} />
                </a>
              </li>
            </ul>
          </div>

          {/* Form */}
          <div className={styles.formWrap}>
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="ok"
                  className={styles.success}
                  role="status"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <span className={styles.okIcon}>
                    <Check size={26} />
                  </span>
                  <h3>Message sent.</h3>
                  <p>Thanks for reaching out. I&apos;ll reply to your email soon.</p>
                  <button className={styles.ghost} onClick={() => setStatus("idle")}>
                    Send another
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  className={styles.form}
                  onSubmit={submit}
                  noValidate
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <fieldset className={styles.topics}>
                    <legend>I&apos;m reaching out about</legend>
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
                      <label htmlFor="c-name">Name</label>
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
                      <label htmlFor="c-email">Email</label>
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
                    <label htmlFor="c-message">Message</label>
                    <textarea
                      id="c-message"
                      rows={6}
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

                  <button className={styles.send} type="submit" disabled={status === "sending"}>
                    {status === "sending" ? (
                      <>
                        <Loader2 size={18} className={styles.spin} /> Sending…
                      </>
                    ) : (
                      <>
                        Send message <Send size={16} />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
