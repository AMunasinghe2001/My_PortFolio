"use client";

import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { FaPaperPlane } from "react-icons/fa";
import useReveal from "@/lib/useReveal";
import styles from "./Contact.module.css";

// EmailJS IDs are publishable by design (they're visible in any client-side
// send). Kept in env so they can be rotated without a code change.
const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_j7datbe";
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_77ryz1s";
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "YFo3I_BZFOWtFQs9w";

export default function Contact() {
  const form = useRef(null);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', text }
  const [sending, setSending] = useState(false);

  useReveal([]);

  const sendEmail = async (e) => {
    e.preventDefault();
    setStatus(null);
    setSending(true);
    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form.current, {
        publicKey: PUBLIC_KEY,
      });
      setStatus({ type: "success", text: "Thanks! Your message has been sent." });
      form.current.reset();
    } catch (err) {
      console.error("EmailJS send failed", err);
      setStatus({
        type: "error",
        text: "Sorry — the message could not be sent. Please try again or email me directly.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="section">
      <div className="container">
        <span className="eyebrow reveal">Let&apos;s work together</span>
        <h2 className="section-title reveal">
          <span className="t-light">Hire</span>
          <span className="t-accent">Me</span>
        </h2>
        <p className="section-sub reveal">
          Got a project in mind? Send me a message and I&apos;ll get back to you.
        </p>

        <div className={`glass ${styles.formCard} reveal`}>
          <form ref={form} onSubmit={sendEmail}>
            <div className={styles.row}>
              <div className="field">
                <label htmlFor="user_name">Name</label>
                <input
                  id="user_name"
                  type="text"
                  name="user_name"
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="user_email">Email</label>
                <input
                  id="user_email"
                  type="email"
                  name="user_email"
                  placeholder="example@gmail.com"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="user_subject">Subject</label>
              <input
                id="user_subject"
                type="text"
                name="user_subject"
                placeholder="What is this about?"
              />
            </div>

            <div className="field">
              <label htmlFor="user_massage">Message</label>
              <textarea
                id="user_massage"
                name="user_massage"
                placeholder="Tell me about your project…"
                required
              />
            </div>

            <div className={styles.submitRow}>
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? "Sending…" : "Send Message"} <FaPaperPlane />
              </button>
            </div>

            {status && (
              <p
                className={`${styles.status} ${
                  status.type === "success" ? styles.ok : styles.bad
                }`}
                role="status"
              >
                {status.text}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
