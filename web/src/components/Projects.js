"use client";

import { useEffect, useState } from "react";
import { FaGithub, FaExternalLinkAlt, FaTimes, FaArrowRight, FaLock, FaBookOpen, FaFolder } from "react-icons/fa";
import api from "@/lib/api";
import useReveal from "@/lib/useReveal";
import MarkdownRenderer from "./MarkdownRenderer";
import styles from "./Projects.module.css";

const FALLBACK = [
  {
    title: "Customs Yard Management System",
    rawName: "Customs_Yard_Management_System",
    repoName: "AMunasinghe2001/Customs_Yard_Management_System",
    technology: "Dart | Python | PLpgSQL",
    description: "An Enterprise Windows Desktop Platform for Seizure Report (SR) Operations, Multi-Yard Warehouse Inventory, Accrued Storage Charges, and Security Workflows.",
    url: "https://github.com/AMunasinghe2001/Customs_Yard_Management_System",
    isPrivate: true,
  },
  {
    title: "Portfolio",
    rawName: "My_PortFolio",
    repoName: "AMunasinghe2001/My_PortFolio",
    technology: "MERN Stack | Next.js",
    description: "Personal Developer Portfolio with dynamic GitHub analytics and liquid glass UI design.",
    url: "https://github.com/AMunasinghe2001/My_PortFolio",
    liveUrl: "https://anushanga-munasinghe.vercel.app",
    image: "/img/projects/portfolio.jpg",
    isPrivate: false,
  },
  {
    title: "Library Management System (Ambalantota PS)",
    rawName: "LibraryManagementSystem_Ambalantota_PS",
    repoName: "AMunasinghe2001/LibraryManagementSystem_Ambalantota_PS",
    technology: "JavaScript | Electron | PostgreSQL",
    description: "A desktop-based Library Management System built with Electron.js and PostgreSQL for Ambalantota Pradeshiya Sabha.",
    url: "https://github.com/AMunasinghe2001/LibraryManagementSystem_Ambalantota_PS",
    isPrivate: true,
  },
  {
    title: "Hotel Booking System",
    rawName: "hotelBookingSystem",
    repoName: "AMunasinghe2001/hotelBookingSystem",
    technology: "PHP | JavaScript | CSS | SQL",
    description: "Hotel Booking and reservation management web application.",
    url: "https://github.com/AMunasinghe2001/hotelBookingSystem",
    image: "/img/projects/hotelbook.jpg",
    isPrivate: false,
  },
  {
    title: "Task Master App",
    rawName: "TaskMasterApp",
    repoName: "AMunasinghe2001/TaskMasterApp",
    technology: "Kotlin | XML",
    description: "Task management and productivity mobile application for Android.",
    url: "https://github.com/AMunasinghe2001/TaskMasterApp",
    image: "/img/projects/todo app.jpg",
    isPrivate: false,
  },
  {
    title: "Game App",
    rawName: "Game_App",
    repoName: "AMunasinghe2001/Game_App",
    technology: "Kotlin | XML",
    description: "Interactive Android mobile game development project.",
    url: "https://github.com/AMunasinghe2001/Game_App",
    image: "/img/projects/game app.jpg",
    isPrivate: false,
  },
  {
    title: "Book Tour Website",
    rawName: "Book-Tour-website-OOP",
    repoName: "AMunasinghe2001/Book-Tour-website-OOP",
    technology: "Java | JSP | SQL",
    description: "Tour reservation and booking system built with Object-Oriented Java and JSP.",
    url: "https://github.com/AMunasinghe2001/Book-Tour-website-OOP",
    image: "/img/projects/oop.jpg",
    isPrivate: false,
  },
];

const isDisplayable = (src) =>
  typeof src === "string" && /^(https?:|\/|data:)/.test(src);

const CLIENT_OVERRIDES = {
  "desktop-learn_control_panel": {
    title: "SLCHRD LMS v2.0",
    description: "An Enterprise Desktop Learning Management System engineered for Sri Lanka Customs to manage officer training programs, academic curricula, resource persons, training costs, and reporting.",
    technology: "Java Swing | FlatLaf | MySQL 8.x | Apache PDFBox",
  },
  "customs_yard_management_system": {
    title: "Customs Yard Management System",
    description: "An Enterprise Windows Desktop Platform for Seizure Report (SR) Operations, Multi-Yard Warehouse Inventory, Accrued Storage Charges, and Security Workflows.",
    technology: "Dart | Python | PLpgSQL",
  },
  "librarymanagementsystem_sl_customs": {
    title: "Customs Library Management System",
    description: "A comprehensive Library Management System engineered for Sri Lanka Customs to streamline book indexing, patron registrations, and borrowing workflows.",
    technology: "Python | MySQL | PyQt | Inno Setup",
  },
  "librarymanagementsystem_ambalantota_ps": {
    title: "Library Management System (Ambalantota PS)",
    description: "A desktop-based Library Management System built with Electron.js and PostgreSQL for Ambalantota Pradeshiya Sabha.",
    technology: "JavaScript | Electron | PostgreSQL",
  },
};

const sanitizeProjectsList = (list) => {
  if (!Array.isArray(list)) return [];
  return list
    .filter((p) => {
      const lower = (p.rawName || p.title || "").toLowerCase().replace(/[-_\s.]+/g, "");
      if (lower.includes("slchrdlms20") || lower === "slchrdlms" || lower === "lms20") {
        return false;
      }
      return true;
    })
    .map((p) => {
      const lowerRaw = (p.rawName || "").toLowerCase();
      const override = CLIENT_OVERRIDES[lowerRaw];
      if (override) {
        return {
          ...p,
          title: override.title || p.title,
          description: override.description || p.description,
          technology: override.technology || p.technology,
        };
      }
      return p;
    });
};


// Merges Admin Panel (MongoDB) custom titles, descriptions, and uploaded images with GitHub projects
const mergeWithAdminProjects = (githubList, adminList) => {
  const gh = Array.isArray(githubList) ? [...githubList] : [];
  const admin = Array.isArray(adminList) ? [...adminList] : [];

  const merged = gh.map((project) => {
    const repoUrl = (project.url || "").toLowerCase();
    const rawLower = (project.rawName || "").toLowerCase();
    const titleLower = (project.title || "").toLowerCase();

    const adminMatch = admin.find((ap) => {
      if (ap.url && ap.url.toLowerCase() === repoUrl) return true;
      if (ap.rawName && ap.rawName.toLowerCase() === rawLower) return true;
      if (ap.title && ap.title.toLowerCase() === titleLower) return true;
      return false;
    });

    if (adminMatch) {
      return {
        ...project,
        title: adminMatch.title || project.title,
        description: adminMatch.description || project.description,
        technology: adminMatch.technology || project.technology,
        image: adminMatch.image || project.image,
        liveUrl: adminMatch.liveUrl || project.liveUrl,
      };
    }
    return project;
  });

  // Include standalone Admin Panel projects (e.g. Pet Care App or manual entries)
  for (const ap of admin) {
    const exists = merged.some(
      (m) =>
        (ap.url && m.url && ap.url.toLowerCase() === m.url.toLowerCase()) ||
        (ap.title && m.title && ap.title.toLowerCase() === m.title.toLowerCase())
    );
    if (!exists && ap.title) {
      merged.push({
        _id: ap._id || String(Math.random()),
        id: ap._id || String(Math.random()),
        title: ap.title,
        repoName: ap.url ? ap.url.replace(/^https?:\/\/github\.com\//i, "") : "",
        rawName: ap.title,
        isCollaborator: false,
        description: ap.description || "Project developed by Anushanga Munasinghe.",
        technology: ap.technology || "Software Development",
        url: ap.url || "",
        liveUrl: ap.liveUrl || "",
        isPrivate: false,
        image: ap.image || null,
        updatedAt: ap.updatedAt || ap.createdAt || new Date().toISOString(),
      });
    }
  }

  return merged;
};

export default function Projects() {
  const [projects, setProjects] = useState(FALLBACK);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [closing, setClosing] = useState(false);
  const [readmeContent, setReadmeContent] = useState(null);
  const [readmeLoading, setReadmeLoading] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setSelected(null);
      setClosing(false);
    }, 240);
  };

  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      let ghList = [];
      let adminList = [];

      // 1. Fetch live GitHub projects (includes personal + group/collaborator repos)
      try {
        const nextRes = await fetch(`/api/github-projects?t=${Date.now()}`, { cache: "no-store" });
        if (nextRes.ok) {
          const nextData = await nextRes.json();
          if (Array.isArray(nextData.projects)) {
            ghList = nextData.projects;
          }
        }
      } catch {}

      // 2. Fetch Admin Panel projects from database to apply live admin edits
      try {
        const adminRes = await api.get(`/projects?t=${Date.now()}`);
        if (Array.isArray(adminRes.data?.projects)) {
          adminList = adminRes.data.projects;
        }
      } catch {}

      if (ghList.length > 0 || adminList.length > 0) {
        const combined = mergeWithAdminProjects(ghList, adminList);
        if (isMounted && combined.length > 0) {
          setProjects(sanitizeProjectsList(combined));
          setLoading(false);
          return;
        }
      }

      // 4. Default verified fallback
      if (isMounted) {
        setProjects(FALLBACK);
        setLoading(false);
      }
    };

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  // When a project modal opens, fetch its README.md dynamically from GitHub
  useEffect(() => {
    if (!selected) {
      setReadmeContent(null);
      setReadmeLoading(false);
      return;
    }

    let isMounted = true;
    setReadmeLoading(true);
    setReadmeContent(null);

    const repoSlug = selected.repoName || selected.rawName || selected.title;

    const fetchReadme = async () => {
      // 1. Try Next.js internal API route (/api/github-projects/readme?repo=...)
      try {
        const nextRes = await fetch(`/api/github-projects/readme?repo=${encodeURIComponent(repoSlug)}&t=${Date.now()}`, { cache: "no-store" });
        if (nextRes.ok) {
          const data = await nextRes.json();
          if (data && data.content && isMounted) {
            setReadmeContent(data.content);
            setReadmeLoading(false);
            return;
          }
        }
      } catch {
        /* try backend next */
      }

      // 2. Try external backend (/github-projects/readme?repo=...)
      try {
        const res = await api.get(`/github-projects/readme?repo=${encodeURIComponent(repoSlug)}&t=${Date.now()}`);
        if (res.data?.content && isMounted) {
          setReadmeContent(res.data.content);
          setReadmeLoading(false);
          return;
        }
      } catch {
        /* fallback to description */
      }

      if (isMounted) {
        setReadmeContent(null);
        setReadmeLoading(false);
      }
    };

    fetchReadme();

    return () => {
      isMounted = false;
    };
  }, [selected]);

  // While modal is open: lock page scroll and close on Escape
  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => e.key === "Escape" && handleClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected]);

  useReveal([projects, loading]);

  return (
    <section id="project" className="section">
      <div className="container">
        <span className="eyebrow reveal">Selected work</span>
        <h2 className="section-title reveal">
          <span className="t-light">Latest</span>
          <span className="t-accent">Projects</span>
        </h2>
        <p className="section-sub reveal">
          Explore all my GitHub projects with live repository synchronization,
          verified tech stacks, and full in-depth README documentation.
        </p>

        <div className={styles.grid}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`glass ${styles.card} ${styles.skeletonCard}`}>
                  <div className={styles.skeletonThumb} />
                  <div className={styles.body}>
                    <div className={styles.skeletonTitle} />
                    <div className={styles.skeletonTech} />
                    <div className={styles.skeletonDesc} />
                  </div>
                </div>
              ))
            : projects.map((project, i) => (
                <article
                  key={project._id || project.id || i}
                  className={`glass glass-hover ${styles.card} reveal`}
                  style={{ transitionDelay: `${(i % 3) * 0.08}s` }}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(project)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(project);
                    }
                  }}
                  aria-label={`View details for ${project.title}`}
                >
                  <div className={styles.badges}>
                    {project.isCollaborator && (
                      <span className={styles.badge} style={{ background: "rgba(20, 184, 166, 0.25)", color: "#2dd4bf", borderColor: "rgba(45, 212, 191, 0.4)", marginRight: 6 }}>
                        Group Project
                      </span>
                    )}
                    {project.isPrivate ? (
                      <span className={`${styles.badge} ${styles.badgePrivate}`}>
                        <FaLock style={{ marginRight: 4 }} /> Private
                      </span>
                    ) : (
                      <span className={`${styles.badge} ${styles.badgePublic}`}>
                        Public
                      </span>
                    )}
                  </div>

                  <div className={styles.thumb}>
                    {isDisplayable(project.image) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.image}
                        alt=""
                        className={styles.thumbImg}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.thumbFallback}>
                        <span className={styles.thumbLetter}>
                          {project.title?.charAt(0) || "P"}
                        </span>
                        <FaFolder className={styles.thumbIcon} />
                      </div>
                    )}
                  </div>

                  <div className={styles.body}>
                    <h3 className={styles.title}>{project.title}</h3>
                    <p className={styles.tech}>{project.technology}</p>
                    <p className={styles.desc}>{project.description}</p>
                    <span className={styles.hint}>
                      View details & README <FaArrowRight />
                    </span>
                  </div>
                </article>
              ))}
        </div>
      </div>

      {selected && (
        <div
          className={`${styles.overlay} ${closing ? styles.overlayClosing : ""}`}
          onClick={handleClose}
        >
          <div
            className={`glass-strong ${styles.modal} ${closing ? styles.modalClosing : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.close}
              onClick={handleClose}
              aria-label="Close"
            >
              <FaTimes />
            </button>

            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{selected.title}</h3>
              <div className={styles.modalMeta}>
                <span className={styles.modalTech}>{selected.technology}</span>
                {selected.isPrivate ? (
                  <span className={`${styles.badge} ${styles.badgePrivate}`}>
                    <FaLock style={{ marginRight: 4 }} /> Private Repository
                  </span>
                ) : (
                  <span className={`${styles.badge} ${styles.badgePublic}`}>
                    Public Repository
                  </span>
                )}
              </div>
            </div>

            <div className={styles.modalScrollArea}>
              <div className={styles.readmeHeaderBadge}>
                <FaBookOpen /> Project Overview & Documentation
              </div>

              {readmeLoading ? (
                <div className={styles.readmeSkeleton}>
                  <p className={styles.readmeNotice}>
                    Fetching README.md directly from GitHub...
                  </p>
                  <div className={styles.skeletonLine} style={{ width: "85%" }} />
                  <div className={styles.skeletonLine} style={{ width: "95%" }} />
                  <div className={styles.skeletonLine} style={{ width: "70%" }} />
                  <div className={styles.skeletonLine} style={{ width: "90%" }} />
                  <div className={styles.skeletonLine} style={{ width: "60%" }} />
                </div>
              ) : readmeContent ? (
                <div className={styles.readmeContainer}>
                  <MarkdownRenderer
                    content={readmeContent}
                    repoFullName={selected.repoName || (selected.rawName ? `AMunasinghe2001/${selected.rawName}` : undefined)}
                  />
                </div>
              ) : (
                <div className={styles.readmeContainer}>
                  <p className={styles.desc} style={{ fontSize: "1.05rem", color: "var(--text)" }}>
                    {selected.description || "No description provided for this repository."}
                  </p>
                  <p className={styles.fallbackNotice}>
                    * Showing repository description as no README.md was found in this repository.
                  </p>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              {selected.url && (
                <a
                  className="btn btn-glass"
                  href={selected.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGithub /> View on GitHub
                </a>
              )}
              {selected.liveUrl && (
                <a
                  className="btn btn-primary"
                  href={selected.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaExternalLinkAlt /> Live Demo
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
