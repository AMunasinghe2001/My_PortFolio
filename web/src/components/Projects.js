"use client";

import { useEffect, useState } from "react";
import { FaGithub, FaExternalLinkAlt, FaTimes, FaArrowRight } from "react-icons/fa";
import api from "@/lib/api";
import useReveal from "@/lib/useReveal";
import styles from "./Projects.module.css";

const FALLBACK = [
  { title: "Portfolio", technology: "MERN Stack", url: "https://github.com/AMunasinghe2001/My_PortFolio", image: "/img/projects/portfolio.jpg" },
  { title: "Hotel Booking", technology: "PHP | JavaScript | CSS | SQL", url: "https://github.com/AMunasinghe2001/hotelBookingSystem", image: "/img/projects/hotelbook.jpg" },
  { title: "Task Master App", technology: "XML | Kotlin", url: "https://github.com/AMunasinghe2001/TaskMasterApp", image: "/img/projects/todo app.jpg" },
  { title: "Game App", technology: "XML | Kotlin", url: "https://github.com/AMunasinghe2001/Game_App", image: "/img/projects/game app.jpg" },
  { title: "Furniture Manage Web App", technology: "MERN Stack", url: "https://github.com/it22606006/Rukshan-Furniture", image: "/img/projects/itp.jpg" },
  { title: "Pet Care App", technology: "XML | Kotlin", url: "", image: "/img/projects/mad.jpg" },
  { title: "Travel Booking Web", technology: "JSP | Java | SQL", url: "https://github.com/AMunasinghe2001/Book-Tour-website-OOP", image: "/img/projects/oop.jpg" },
  { title: "Rukshan Furniture Web", technology: "MERN Stack | Vite", url: "https://github.com/Bashitha-Weerapperuma/Rukshan-furniture-demo", image: "/img/projects/rukshanferniture.jpg" },
  { title: "Share Me Web", technology: "React | Spring Boot", url: "https://github.com/oshanLahiru0307/Share_me-App", image: "/img/projects/PAF.png" },
  { title: "Home Stock Web App", technology: "MERN Stack", url: "https://github.com/oshanLahiru0307/ITPM_Project", image: "/img/projects/ITPM.png" },
];

// A usable image src: a full URL, an absolute/bundled path, or a data URI.
// (Old DB records may hold a bare filename like "portfolio.jpg" — skip those
// so we show the card gradient instead of a broken-image icon.)
const isDisplayable = (src) =>
  typeof src === "string" && /^(https?:|\/|data:)/.test(src);

export default function Projects() {
  const [projects, setProjects] = useState(FALLBACK);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api
      .get("/projects")
      .then((res) => {
        const data = res.data?.projects;
        if (Array.isArray(data) && data.length) setProjects(data);
      })
      .catch((err) => console.error("Projects fetch failed", err));
  }, []);

  // While the modal is open: lock page scroll and close on Escape.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => e.key === "Escape" && setSelected(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected]);

  useReveal([projects]);

  return (
    <section id="project" className="section">
      <div className="container">
        <span className="eyebrow reveal">Selected work</span>
        <h2 className="section-title reveal">
          <span className="t-light">Latest</span>
          <span className="t-accent">Projects</span>
        </h2>
        <p className="section-sub reveal">
          A selection of things I&apos;ve designed and built. Tap any card for details.
        </p>

        <div className={styles.grid}>
          {projects.map((project, i) => (
            <article
              key={project._id || i}
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
              <div className={styles.thumb}>
                {isDisplayable(project.image) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.image} alt="" className={styles.thumbImg} loading="lazy" />
                ) : (
                  <span className={styles.thumbFallback} aria-hidden="true">
                    {project.title?.charAt(0) || "?"}
                  </span>
                )}
              </div>

              <div className={styles.body}>
                <h3 className={styles.title}>{project.title}</h3>
                <p className={styles.tech}>{project.technology}</p>
                <span className={styles.hint}>
                  View details <FaArrowRight />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div
            className={`glass-strong ${styles.modal}`}
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.close}
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              <FaTimes />
            </button>

            {isDisplayable(selected.image) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selected.image} alt="" className={styles.modalImg} />
            )}

            <div className={styles.modalBody}>
              <h3 className={styles.modalTitle}>{selected.title}</h3>
              <p className={styles.modalTech}>{selected.technology}</p>

              <p className={styles.modalDesc}>
                {selected.description || "No description added yet."}
              </p>

              <div className={styles.modalActions}>
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
        </div>
      )}
    </section>
  );
}
