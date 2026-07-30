"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getCachedProfile, fetchProfile } from "@/lib/profile";
import useReveal from "@/lib/useReveal";
import styles from "./About.module.css";

const isCloudinaryUrl = (url) => typeof url === "string" && url.includes("res.cloudinary.com");

const FALLBACK_PARAGRAPHS = [
  "I am a skilled and versatile professional in full-stack development and UI/UX design. With a passion for creating innovative digital solutions, I excel at transforming complex concepts into visually appealing and user-friendly experiences. My expertise includes HTML, CSS, JavaScript, PHP, ReactJS, and frameworks. I take pride in delivering high-quality code that exceeds expectations and am adept at problem-solving.",
  "Beyond my technical skills, I am a talented artist, architect, photographer, etc. and a very active citizen in the arts. I share my artistic knowledge and insights extensively with my full-stack development and UI/UX design. My strong aim is to provide maximum satisfaction to my clients through web development and design along with my artistic knowledge and technical knowledge.",
  "I am enthusiastic about collaborating with like-minded individuals and contributing my expertise to craft exceptional web experiences that captivate and engage users. By attending conferences and workshops, I stay up-to-date with the latest industry trends and continuously enhance my skills.",
];

const STATS = [
  { value: "10+", label: "Projects Built" },
  { value: "3+", label: "Years Coding" },
  { value: "5+", label: "Tech Stacks" },
];

export default function About() {
  const [paragraphs, setParagraphs] = useState(FALLBACK_PARAGRAPHS);
  const [image, setImage] = useState("");

  useEffect(() => {
    const cached = getCachedProfile();
    if (cached?.aboutParagraphs?.length) setParagraphs(cached.aboutParagraphs);
    if (cached?.aboutImage) setImage(cached.aboutImage);

    fetchProfile()
      .then((p) => {
        if (!p) return;
        if (p.aboutParagraphs?.length) setParagraphs(p.aboutParagraphs);
        if (p.aboutImage) setImage(p.aboutImage);
      })
      .catch((err) => console.error("About fetch failed", err));
  }, []);

  useReveal([paragraphs]);

  return (
    <section id="about" className="section">
      <div className="container">
        <span className="eyebrow reveal">Get to know me</span>
        <h2 className="section-title reveal">
          <span className="t-light">About</span>
          <span className="t-accent">Me</span>
        </h2>

        <div className={styles.grid}>
          <div className={`${styles.imageCol} reveal`}>
            {/* Sized to the circle so the halo can be centred on the image. */}
            <div className={styles.imageWrap}>
              <span className={styles.glow} aria-hidden="true" />
              <div className={styles.frame}>
                <Image
                  src={image || "/img/about.png"}
                  alt="Anushanga Munasinghe"
                  fill
                  sizes="(max-width: 900px) 70vw, 420px"
                  className={styles.img}
                  unoptimized={isCloudinaryUrl(image)}
                />
              </div>
            </div>
          </div>

          <div className={styles.textCol}>
            <div className={`glass ${styles.card} reveal`}>
              {paragraphs.map((para, i) => (
                <p key={i} className={styles.para}>
                  {para}
                </p>
              ))}
            </div>

            <div className={styles.stats}>
              {STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`glass glass-hover ${styles.stat} reveal`}
                  style={{ transitionDelay: `${i * 0.09}s` }}
                >
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
