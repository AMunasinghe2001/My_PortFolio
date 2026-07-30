"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import useReveal from "@/lib/useReveal";
import styles from "./Skills.module.css";

const FALLBACK_TECHNICAL = [
  { title: "Dart", percentage: 100 },
  { title: "Python", percentage: 55 },
  { title: "Java", percentage: 29 },
  { title: "JavaScript", percentage: 25 },
  { title: "PHP", percentage: 21 },
  { title: "CSS", percentage: 16 },
  { title: "C++", percentage: 13 },
];

const FALLBACK_DATABASE = [
  { title: "MongoDB", percentage: 100 },
  { title: "Supabase", percentage: 100 },
  { title: "PostgreSQL", percentage: 71 },
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

const GITHUB_USERNAME = "AMunasinghe2001";
const GITHUB_HEADERS = {
  Accept: "application/vnd.github+json",
  "User-Agent": "portfolio-web",
};

export default function Skills() {
  const [technical, setTechnical] = useState(FALLBACK_TECHNICAL);
  const [databases, setDatabases] = useState(FALLBACK_DATABASE);
  const [tools, setTools] = useState(FALLBACK_TOOLS);
  const [professional, setProfessional] = useState(FALLBACK_PROFESSIONAL);

  useEffect(() => {
    // Technical Skills + Database Management are generated automatically from
    // GitHub; Tools + Professional come from the admin-managed DB.
    const loadGithubSkills = async () => {
      try {
        const res = await api.get("/github-skills");
        const data = res.data || {};
        const hasSkills = Array.isArray(data.skills) && data.skills.length > 0;
        const hasDatabases = Array.isArray(data.databases) && data.databases.length > 0;

        if (hasSkills) setTechnical(data.skills);
        if (hasDatabases) setDatabases(data.databases);

        if (!hasSkills) {
          await loadPublicGithubSkills();
        }
      } catch (err) {
        console.error("GitHub skills fetch failed", err);
        await loadPublicGithubSkills();
      }
    };

    const loadPublicGithubSkills = async () => {
      try {
        const reposRes = await fetch(
          `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`,
          { headers: GITHUB_HEADERS }
        );
        if (!reposRes.ok) return;

        const repos = (await reposRes.json()).filter((repo) => !repo.fork);
        if (!repos.length) return;

        const totals = {};
        await Promise.all(
          repos.map(async (repo) => {
            try {
              const res = await fetch(repo.languages_url, { headers: GITHUB_HEADERS });
              if (!res.ok) return;
              const langs = await res.json();
              for (const [lang, bytes] of Object.entries(langs)) {
                totals[lang] = (totals[lang] || 0) + bytes;
              }
            } catch {
              /* ignore a single repo that fails */
            }
          })
        );

        const entries = Object.entries(totals);
        if (!entries.length) return;

        const grandTotal = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
        const skills = entries
          .filter(([, bytes]) => bytes / grandTotal >= 0.01)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([title, bytes]) => ({
            title,
            percentage: Math.max(1, Math.round((bytes / grandTotal) * 100)),
            category: "technical",
          }));

        if (skills.length) setTechnical(skills);
      } catch (err) {
        console.error("Public GitHub skills fetch failed", err);
      }
    };

    loadGithubSkills();

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
      .catch((err) => {
        console.error("Skills fetch failed", err);
      });
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
          Technical skills and database experience are powered by GitHub data,
          with a polished fallback that keeps the section consistent if the API
          is unavailable.
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
