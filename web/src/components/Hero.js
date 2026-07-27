"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FaDownload, FaArrowRight } from "react-icons/fa";
import { getCachedProfile, fetchProfile } from "@/lib/profile";
import CursorField from "./CursorField";
import styles from "./Hero.module.css";

const FALLBACK = {
  greeting: "Hello, It's Me...",
  name: "Anushanga Munasinghe",
  jobTitles: [
    "Frontend Developer",
    "Backend Developer",
    "UI/UX Designer",
    "Mobile App Developer",
    "Software Developer",
  ],
  intro:
    "Welcome to my portfolio! I'm a full-stack developer, UI/UX designer and Mobile app developer passionate about crafting exceptional digital experiences. Browse through my work and discover my expertise in front-end development and design. Let's create something extraordinary together!",
  resumeUrl: "/Anushanga Munasinghe CV.pdf",
  heroImage: "",
};

// Cloudinary needs fl_attachment to force a download with a real filename;
// the bundled PDF is handled by the `download` attribute instead.
const buildResumeHref = (url) => {
  const href = url || FALLBACK.resumeUrl;
  if (href.includes("res.cloudinary.com") && href.includes("/upload/")) {
    let u = href.replace("/upload/", "/upload/fl_attachment:Anushanga-Munasinghe-CV/");
    if (!/\.pdf(\?|$)/i.test(u)) u += ".pdf";
    return u;
  }
  return href;
};

export default function Hero() {
  // Seed from cache so a reload shows the correct hero image immediately
  // rather than flashing the bundled fallback first.
  const [profile, setProfile] = useState(FALLBACK);

  useEffect(() => {
    const cached = getCachedProfile();
    if (cached) setProfile((p) => ({ ...p, ...cached }));

    fetchProfile()
      .then((p) => p && setProfile((prev) => ({ ...prev, ...p })))
      .catch((err) => console.error("Profile fetch failed", err));
  }, []);

  const titles = profile.jobTitles?.length ? profile.jobTitles : FALLBACK.jobTitles;
  const typed = useTypewriter(titles);

  return (
    <section id="home" className={styles.hero}>
      <CursorField />
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className={`${styles.greeting} reveal is-visible`}>
            <span className={styles.dot} />
            {profile.greeting}
          </span>

          <h1 className={styles.name}>{profile.name}</h1>

          <p className={styles.and}>And I&apos;m a</p>

          <div className={styles.role} aria-live="polite">
            <span className={styles.roleText}>{typed}</span>
            <span className={styles.caret} aria-hidden="true" />
          </div>

          <p className={styles.intro}>{profile.intro}</p>

          <div className={styles.ctas}>
            <a
              className="btn btn-primary"
              href={buildResumeHref(profile.resumeUrl)}
              download="Anushanga-Munasinghe-CV.pdf"
            >
              Download Resume <FaDownload />
            </a>
            <a
              className="btn btn-glass"
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Hire Me <FaArrowRight />
            </a>
          </div>
        </div>

        <div className={styles.portrait}>
          {/* Glow pad behind the cut-out so it reads as lit, not pasted on. */}
          <span className={styles.portraitGlow} aria-hidden="true" />
          <div className={styles.portraitFrame}>
            {profile.heroImage ? (
              // Admin-uploaded (Cloudinary) — dimensions unknown, so `fill`.
              <Image
                src={profile.heroImage}
                alt="Anushanga Munasinghe"
                fill
                priority
                sizes="(max-width: 900px) 78vw, 460px"
                className={styles.portraitImg}
              />
            ) : (
              <Image
                src="/img/hero.png"
                alt="Anushanga Munasinghe"
                fill
                priority
                sizes="(max-width: 900px) 78vw, 460px"
                className={styles.portraitImg}
              />
            )}
          </div>
        </div>
      </div>

      <a
        className={styles.scrollCue}
        href="#about"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
        }}
        aria-label="Scroll to about"
      >
        <span className={styles.mouse}>
          <span className={styles.wheel} />
        </span>
      </a>
    </section>
  );
}

/* Types each title out, holds, deletes, then moves to the next one. */
function useTypewriter(titles) {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  // Restart cleanly whenever the set of titles changes (e.g. after fetch).
  useEffect(() => {
    setText("");
    setIndex(0);
    setDeleting(false);
  }, [titles]);

  useEffect(() => {
    const current = titles[index % titles.length] || "";

    if (!deleting && text === current) {
      const hold = setTimeout(() => setDeleting(true), 1900);
      return () => clearTimeout(hold);
    }

    if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % titles.length);
      return;
    }

    const tick = setTimeout(
      () =>
        setText((t) =>
          deleting ? current.slice(0, t.length - 1) : current.slice(0, t.length + 1)
        ),
      deleting ? 55 : 105
    );
    return () => clearTimeout(tick);
  }, [text, deleting, index, titles]);

  return text;
}
