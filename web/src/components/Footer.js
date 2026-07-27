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
    email: "anushangamunasinghe@gmail.com",
    locationLabel: "Tangalle, Sri Lanka",
    locationUrl:
      "https://www.google.com/maps/search/?api=1&query=6.0317151,80.7904811",
  },
};

// Every contact route renders as the same round icon button. `email` and
// `location` are built from their own fields rather than being plain URLs,
// so they get a mailto: link and a tooltip respectively.
const SOCIALS = [
  { key: "email", label: "Email", Icon: FaEnvelope },
  { key: "location", label: "Location", Icon: FaMapMarkerAlt },
  { key: "facebook", label: "Facebook", Icon: FaFacebookF },
  { key: "whatsapp", label: "WhatsApp", Icon: FaWhatsapp },
  { key: "github", label: "GitHub", Icon: FaGithub },
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn },
];

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

        {/* Email, location and the social profiles share one row of icon
            buttons — every contact route reads as a single set. */}
        <div className={styles.socials}>
          {SOCIALS.map(({ key, label, Icon }) => {
            const s = data.social || {};

            let href;
            let title = label;
            let external = true;

            if (key === "email") {
              if (!s.email) return null;
              href = `mailto:${s.email}`;
              title = s.email;
              // mailto: must open in the mail client, not a new tab.
              external = false;
            } else if (key === "location") {
              if (!s.locationUrl) return null;
              href = s.locationUrl;
              title = s.locationLabel || label;
            } else {
              if (!s[key]) return null;
              href = s[key];
            }

            return (
              <a
                key={key}
                href={href}
                className={styles.social}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                aria-label={title}
                title={title}
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
