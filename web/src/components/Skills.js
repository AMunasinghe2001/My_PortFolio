"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import useReveal from "@/lib/useReveal";
import styles from "./Skills.module.css";

const FALLBACK_TECHNICAL = [
  { title: "Dart", percentage: 100 },
  { title: "TypeScript", percentage: 33 },
  { title: "JavaScript", percentage: 25 },
  { title: "Python", percentage: 20 },
  { title: "Java", percentage: 29 },
  { title: "PHP", percentage: 21 },
  { title: "CSS", percentage: 16 },
  { title: "C++", percentage: 13 },
];

const FALLBACK_DATABASE = [
  { title: "PostgreSQL", percentage: 100 },
  { title: "MongoDB", percentage: 100 },
  { title: "Firebase", percentage: 50 },
  { title: "Supabase", percentage: 50 },
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

const GITHUB_USERNAME = process.env.NEXT_PUBLIC_GITHUB_USERNAME || "AMunasinghe2001";

const getClientGhHeaders = () => {
  const token = (process.env.NEXT_PUBLIC_GITHUB_TOKEN || "").trim();
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-web",
  };
  if (token) {
    const cleanToken = token.replace(/^(Bearer|token)\s+/i, "").trim();
    headers.Authorization = `Bearer ${cleanToken}`;
  }
  return headers;
};

export default function Skills() {
  const [loading, setLoading] = useState(true);
  const [technical, setTechnical] = useState([]);
  const [databases, setDatabases] = useState([]);
  const [tools, setTools] = useState([]);
  const [professional, setProfessional] = useState([]);

  useEffect(() => {
    let isMounted = true;

    // Helper for direct GitHub client fallback
    const fetchDirectGithub = async () => {
      try {
        const token = (process.env.NEXT_PUBLIC_GITHUB_TOKEN || "").trim();
        const headers = getClientGhHeaders();
        const url = token
          ? `https://api.github.com/user/repos?per_page=100&visibility=all&affiliation=owner&sort=updated`
          : `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`;

        const reposRes = await fetch(url, { headers });
        if (!reposRes.ok) return null;

        const rawRepos = await reposRes.json();
        const repos = Array.isArray(rawRepos) ? rawRepos.filter((repo) => !repo.fork) : [];
        if (!repos.length) return null;

        const totals = {};
        await Promise.all(
          repos.map(async (repo) => {
            try {
              const res = await fetch(repo.languages_url, { headers });
              if (!res.ok) return;
              const langs = await res.json();
              for (const [lang, bytes] of Object.entries(langs)) {
                totals[lang] = (totals[lang] || 0) + bytes;
              }
            } catch {
              /* ignore single repo failure */
            }
          })
        );

        const entries = Object.entries(totals);
        if (!entries.length) return null;

        const grandTotal = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
        const maxBytes = Math.max(...entries.map(([, bytes]) => bytes));
        const skills = entries
          .filter(([, bytes]) => bytes / grandTotal >= 0.005)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 12)
          .map(([title, bytes]) => ({
            title,
            percentage: Math.max(1, Math.round((bytes / maxBytes) * 100)),
            category: "technical",
          }));

        return { skills, databases: FALLBACK_DATABASE };
      } catch {
        return null;
      }
    };

    // 1. Fetch GitHub skills (from internal Next.js API, external Express backend, or direct client)
    const fetchGithubData = async () => {
      // Try internal Next.js API route (/api/github-skills)
      try {
        const nextRes = await fetch("/api/github-skills");
        if (nextRes.ok) {
          const nextData = await nextRes.json();
          if (Array.isArray(nextData.skills) && nextData.skills.length > 0) {
            return {
              skills: nextData.skills,
              databases: Array.isArray(nextData.databases) && nextData.databases.length > 0
                ? nextData.databases
                : FALLBACK_DATABASE,
            };
          }
        }
      } catch {
        /* try backend next */
      }

      // Try external Express backend (/github-skills)
      try {
        const res = await api.get("/github-skills");
        const data = res.data || {};
        if (Array.isArray(data.skills) && data.skills.length > 0) {
          const hasDart = data.skills.some((s) => s.title.toLowerCase() === "dart");
          let finalSkills = data.skills;
          let finalDatabases = Array.isArray(data.databases) && data.databases.length > 0
            ? data.databases
            : FALLBACK_DATABASE;

          if (!data.authenticated && !hasDart) {
            finalSkills = [
              ...data.skills,
              ...FALLBACK_TECHNICAL.filter(
                (f) => !data.skills.some((s) => s.title.toLowerCase() === f.title.toLowerCase())
              ),
            ];
            finalDatabases = [
              ...finalDatabases,
              ...FALLBACK_DATABASE.filter(
                (f) => !finalDatabases.some((d) => d.title.toLowerCase() === f.title.toLowerCase())
              ),
            ];
          }

          return {
            skills: finalSkills,
            databases: finalDatabases,
          };
        }
      } catch {
        /* try direct GitHub next */
      }

      // Try direct GitHub API call
      const directData = await fetchDirectGithub();
      if (directData && directData.skills?.length > 0) {
        return directData;
      }

      // Fallback only if all sources failed
      return {
        skills: FALLBACK_TECHNICAL,
        databases: FALLBACK_DATABASE,
      };
    };

    // 2. Fetch admin-managed skills (Tools & Professional)
    const fetchAdminSkills = async () => {
      try {
        const res = await api.get("/skills");
        const skills = res.data?.skills;
        if (Array.isArray(skills) && skills.length > 0) {
          const t = skills.filter((s) => s.category === "tool");
          const p = skills.filter((s) => s.category === "professional");
          return {
            tools: t.length ? t : FALLBACK_TOOLS,
            professional: p.length ? p : FALLBACK_PROFESSIONAL,
          };
        }
      } catch {
        /* fallback */
      }
      return {
        tools: FALLBACK_TOOLS,
        professional: FALLBACK_PROFESSIONAL,
      };
    };

    // Execute concurrently and populate state cleanly with no premature/wrong numbers
    const loadAll = async () => {
      try {
        const [gh, admin] = await Promise.all([fetchGithubData(), fetchAdminSkills()]);
        if (!isMounted) return;

        setTechnical(gh.skills);
        setDatabases(gh.databases);
        setTools(admin.tools);
        setProfessional(admin.professional);
      } catch (err) {
        if (!isMounted) return;
        setTechnical(FALLBACK_TECHNICAL);
        setDatabases(FALLBACK_DATABASE);
        setTools(FALLBACK_TOOLS);
        setProfessional(FALLBACK_PROFESSIONAL);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAll();

    return () => {
      isMounted = false;
    };
  }, []);

  useReveal([technical, databases, tools, professional, loading]);

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
          with verified repository analytics and smooth real-time visualization.
        </p>

        <div className={styles.grid}>
          {groups.map((group, i) => (
            <div
              key={group.label}
              className={`glass glass-hover ${styles.card} reveal`}
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <h3 className={styles.cardTitle}>{group.label}</h3>
              {loading ? (
                <SkillSkeleton count={4} />
              ) : (
                <div className={`${styles.bars} ${styles.fadeIn}`}>
                  {group.items.map((skill, j) => (
                    <SkillBar
                      key={skill._id || `${skill.title}-${j}`}
                      title={skill.title}
                      percentage={skill.percentage}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Shimmer Skeleton Placeholder shown while real API data is being loaded */
function SkillSkeleton({ count = 4 }) {
  return (
    <div className={styles.bars}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.skeletonItem}>
          <div className={styles.skeletonHead}>
            <div
              className={styles.skeletonTitle}
              style={{ width: `${35 + (i % 3) * 15}%` }}
            />
            <div className={styles.skeletonPct} />
          </div>
          <div className={styles.skeletonTrack} />
        </div>
      ))}
    </div>
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
