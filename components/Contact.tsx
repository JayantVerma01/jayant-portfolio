"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Send, MapPin, Clock, CheckCircle } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { personalInfo } from "@/lib/data";
import styles from "./Contact.module.css";

type Status = "idle" | "sending" | "success" | "error";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.message.trim() || form.message.length < 10) e.message = "Message must be at least 10 characters";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 4000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  const CONTACTS = [
    {
      icon: <Mail size={20} />,
      label: "Email",
      value: personalInfo.email,
      href: `mailto:${personalInfo.email}`,
      color: "#6366f1",
    },
    {
      icon: <FaGithub size={20} />,
      label: "GitHub",
      value: personalInfo.github,
      href: personalInfo.github,
      color: "#8b5cf6",
    },
    {
      icon: <FaLinkedin size={20} />,
      label: "LinkedIn",
      value: personalInfo.linkedin,
      href: personalInfo.linkedin,
      color: "#06b6d4",
    },
  ];

  return (
    <section id="contact" className={`section ${styles.contact}`}>
      <div className="container">
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-tag">Contact</span>
          <h2 className="section-title">
            Let&apos;s Work{" "}
            <span className="gradient-text">Together</span>
          </h2>
          <p className="section-subtitle">
            Have a project in mind? Let&apos;s build something amazing together. I&apos;m always open to exciting opportunities.
          </p>
        </motion.div>

        <div className={styles.grid}>
          {/* Left: info */}
          <motion.div
            className={styles.info}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={`glass-card ${styles.infoCard}`}>
              <h3 className={styles.infoTitle}>Get in Touch 👋</h3>
              <p className={styles.infoText}>
                I&apos;m currently available for freelance projects, full-time positions, and interesting collaborations. Whether you have a question or want to discuss a project, my inbox is always open.
              </p>

              <div className={styles.contactLinks}>
                {CONTACTS.map((c, i) => (
                  <motion.a
                    key={c.label}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.contactLink}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02, x: 6 }}
                  >
                    <div
                      className={styles.contactIcon}
                      style={{ background: `${c.color}15`, color: c.color, border: `1px solid ${c.color}30` }}
                    >
                      {c.icon}
                    </div>
                    <div>
                      <div className={styles.contactLinkLabel}>{c.label}</div>
                      <div className={styles.contactLinkValue}>{c.value}</div>
                    </div>
                  </motion.a>
                ))}
              </div>

              <div className={styles.extras}>
                <div className={styles.extraItem}>
                  <MapPin size={14} />
                  <span>Based in {personalInfo.location} 🇮🇳</span>
                </div>
                <div className={styles.extraItem}>
                  <Clock size={14} />
                  <span>Responds within 24 hours</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <div className={`glass-card ${styles.formCard}`}>
              <h3 className={styles.formTitle}>Send a Message</h3>

              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    className={styles.successMsg}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <CheckCircle size={48} style={{ color: "#10b981" }} />
                    <h4>Message Sent! 🎉</h4>
                    <p>Thanks for reaching out. I&apos;ll get back to you within 24 hours.</p>
                  </motion.div>
                ) : (
                  <motion.form
                    onSubmit={handleSubmit}
                    className={styles.form}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className={styles.formRow}>
                      <div className={styles.field}>
                        <label htmlFor="name" className={styles.label}>Name *</label>
                        <input
                          id="name"
                          type="text"
                          className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                          placeholder="Jayant Verma"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                        {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="email" className={styles.label}>Email *</label>
                        <input
                          id="email"
                          type="email"
                          className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                        {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                      </div>
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="subject" className={styles.label}>Subject</label>
                      <input
                        id="subject"
                        type="text"
                        className={styles.input}
                        placeholder="Project Collaboration"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      />
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="message" className={styles.label}>Message *</label>
                      <textarea
                        id="message"
                        className={`${styles.textarea} ${errors.message ? styles.inputError : ""}`}
                        placeholder="Tell me about your project..."
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                      />
                      {errors.message && <span className={styles.errorText}>{errors.message}</span>}
                    </div>

                    <motion.button
                      type="submit"
                      className={`btn btn-primary ${styles.submitBtn}`}
                      disabled={status === "sending"}
                      whileHover={status !== "sending" ? { scale: 1.02 } : {}}
                      whileTap={status !== "sending" ? { scale: 0.98 } : {}}
                    >
                      {status === "sending" ? (
                        <>
                          <span className={styles.spinner} />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send Message
                        </>
                      )}
                    </motion.button>

                    {status === "error" && (
                      <p className={styles.errorMsg}>
                        Something went wrong. Please try again or email directly.
                      </p>
                    )}
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
