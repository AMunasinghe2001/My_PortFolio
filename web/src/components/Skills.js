"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import useReveal from "@/lib/useReveal";
import styles from "./Skills.module.css";

const FALLBACK_TECHNICAL = [
  { title: "FIGMA", percentage: 97 },
  { title: "HTML 5", percentage: 96 },
  { title: "CSS", percentage: 96 },
  { title: "JavaScript", percentage: 72 },
  { title: "React JS", percentage: 89 },
  { title: "PHP", percentage: 83 },
  { title: "MySQL", percentage: 71 },
];

const FALLBACK_DATABASE = [
  { title: "MongoDB", percentage: 90 },
  { title: "MySQL", percentage: 85 },
  { title: "Supabase", percentage: 82 },
  { title: "Firebase", percentage: 78 },
];

const FALLBACK_TOOLS = [
  { title: "Git / GitHub", percentage: 92 },
  { title: "VS Code", percentage: 95 },
  { title: "Figma", percentage: 90 },
  { title: "Postman", percentage: 85 },
  { title: "XAMPP", percentage: 80 },
];

const FALLBACK_PROFESSIONAL = [
  { title: "Communication", percentage: 90 },
  { title: "Team Work", percentage: 95 },
  { title: "Project Management", percentage: 87 },
  { title: "Creativity", percentage: 95 },
];

export default function Skills() {
  const [technical, setTechnical] = useState(FALLBACK_TECHNICAL);
  const [databases, setDatabases] = useState(FALLBACK_DATABASE);
  const [tools, setTools] = useState(FALLBACK_TOOLS);
  const [professional, setProfessional] = useState(FALLBACK_PROFESSIONAL);

  useEffect(() => {
    // Technical Skills + Database Management are generated automatically from
    // GitHub; Tools + Professional come from the admin-managed DB.
    api
      .get("/github-skills")
      .then((res) => {
        const data = res.data || {};
        if (data.skills?.length) setTechnical(data.skills);
        if (data.databases?.length) setDatabases(data.databases);
      })
      .catch((err) => console.error("GitHub skills fetch failed", err));

    api
      .get("/skills")
      .then((res) => {
        const skills = res.data?.skills;
        if (!Array.isArray(skills)) return;
        const t = skills.filter((s) => s.category === "tool");
        if (t.length) setTools(t);
        const p = skills.filter((s) => s.category === "professional");
        if (p.length) setProfessional(p);
      })
      .catch((err) => console.error("Skills fetch failed", err));
  }, []);

  useReveal([technical, databases, tools, professional]);

  const groups = [
    { label: "Technical Skills", items: technical },
    { label: "Database Management", items: databases },
    { label: "Tools", items: tools },
    { label: "Professional Skills", items: professional },
  ];

  return (
    <section id="skills" className="section">
      <div className="container">
        <span className="eyebrow reveal">What I work with</span>
        <h2 className="section-title reveal">
          <span className="t-light">My</span>
          <span className="t-accent">Skills</span>
        </h2>
        <p className="section-sub reveal">
          Technical skills and database experience are generated automatically from my
          GitHub activity.
        </p>

        <div className={styles.grid}>
          {groups.map((group, i) => (
            <div
              key={group.label}
              className={`glass glass-hover ${styles.card} reveal`}
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <h3 className={styles.cardTitle}>{group.label}</h3>
              <div className={styles.bars}>
                {group.items.map((skill, j) => (
                  <SkillBar
                    key={skill._id || `${skill.title}-${j}`}
                    title={skill.title}
                    percentage={skill.percentage}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* A single labelled bar. The fill animates from 0 the first time the bar
   scrolls into view, so the numbers read as "counting up". */
function SkillBar({ title, percentage }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pct = Math.max(0, Math.min(100, Number(percentage) || 0));

  return (
    <div className={styles.bar} ref={ref}>
      <div className={styles.barHead}>
        <span className={styles.barTitle}>{title}</span>
        <span className={styles.barPct}>{pct}%</span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-label={title}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span className={styles.fill} style={{ width: shown ? `${pct}%` : 0 }} />
      </div>
    </div>
  );
}
