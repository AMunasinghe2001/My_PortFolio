"use client";

import { useEffect, useState } from "react";
import {
  FaFacebookF,
  FaWhatsapp,
  FaGithub,
  FaLinkedinIn,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { getCachedProfile, fetchProfile } from "@/lib/profile";
import styles from "./Footer.module.css";

const FALLBACK = {
  name: "Anushanga Munasinghe",
  footerTagline:
    "A focused Web Developer building the Websites and Web Applications that lead to the success of the overall product",
  copyrightName: "Anushanga Munasinghe",
  social: {
    facebook: "https://web.facebook.com/anushanga.kawshan.1",
    whatsapp: "https://wa.me/qr/PNKZI5JKCMJKK1",
    github: "https://github.com/AMunasinghe2001",
    linkedin: "https://www.linkedin.com/in/anushanga-munasinghe-9b51882a2/",
  },
};

const SOCIALS = [
  { key: "facebook", label: "Facebook", Icon: FaFacebookF },
  { key: "whatsapp", label: "WhatsApp", Icon: FaWhatsapp },
  { key: "github", label: "GitHub", Icon: FaGithub },
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn },
];

const EMAIL = "anushangamunasinghe@gmail.com";

// Home location (Tangalle). `?q=<lat>,<lng>` drops a pin at exactly these
// coordinates and opens the Google Maps app on mobile.
const LOCATION_LABEL = "Tangalle, Sri Lanka";
const LOCATION_URL =
  "https://www.google.com/maps/search/?api=1&query=6.0317151,80.7904811";

const toData = (p) => ({
  name: p.name || FALLBACK.name,
  footerTagline: p.footerTagline || FALLBACK.footerTagline,
  copyrightName: p.copyrightName || FALLBACK.copyrightName,
  social: { ...FALLBACK.social, ...(p.social || {}) },
});

export default function Footer() {
  const [data, setData] = useState(FALLBACK);

  useEffect(() => {
    const cached = getCachedProfile();
    if (cached) setData(toData(cached));

    fetchProfile()
      .then((p) => p && setData(toData(p)))
      .catch((err) => console.error("Footer fetch failed", err));
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={`glass ${styles.panel}`}>
        <h3 className={styles.name}>{data.name}</h3>
        <p className={styles.tagline}>{data.footerTagline}</p>

        <div className={styles.contact}>
          <a className={styles.contactItem} href={`mailto:${EMAIL}`}>
            <span className={styles.contactIcon}>
              <FaEnvelope />
            </span>
            <span className={styles.contactText}>{EMAIL}</span>
          </a>

          <a
            className={styles.contactItem}
            href={LOCATION_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={styles.contactIcon}>
              <FaMapMarkerAlt />
            </span>
            <span className={styles.contactText}>{LOCATION_LABEL}</span>
          </a>
        </div>

        <div className={styles.socials}>
          {SOCIALS.map(({ key, label, Icon }) => {
            const href = data.social?.[key];
            if (!href) return null;
            return (
              <a
                key={key}
                href={href}
                className={styles.social}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
              >
                <Icon />
              </a>
            );
          })}
        </div>

        <div className={styles.bottom}>
          <p>
            &copy; {new Date().getFullYear()} — Designed &amp; built by{" "}
            <span className={styles.designer}>{data.copyrightName}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
