import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import './project.css';
import { FaLink, FaGithub, FaExternalLinkAlt, FaTimes, FaLock, FaBookOpen } from 'react-icons/fa';
import MarkdownRenderer from './MarkdownRenderer';

// Bundled images used as a fallback when the API is empty or unreachable.
import portfolio from './img/portfolio.jpg';
import hotelbook from './img/hotelbook.jpg';
import todo from './img/todo app.jpg';
import game from './img/game app.jpg';
import itp from './img/itp.jpg';
import mad from './img/mad.jpg';
import oop from './img/oop.jpg';
import rukshan from './img/rukshanferniture.jpg';
import paf from './img/PAF.png';
import itpm from './img/ITPM.png';

const fallbackProjects = [
    {
        title: "Customs Yard Management System",
        technology: "Dart | Python | PLpgSQL",
        url: "https://github.com/AMunasinghe2001/Customs_Yard_Management_System",
        repoName: "AMunasinghe2001/Customs_Yard_Management_System",
        rawName: "Customs_Yard_Management_System",
        description: "An Enterprise Windows Desktop Platform for Seizure Report (SR) Operations, Multi-Yard Warehouse Inventory, Accrued Storage Charges, and Security Workflows.",
        isPrivate: true,
    },
    {
        title: "Library Management System (Ambalantota PS)",
        technology: "JavaScript | Electron | PostgreSQL",
        url: "https://github.com/AMunasinghe2001/LibraryManagementSystem_Ambalantota_PS",
        repoName: "AMunasinghe2001/LibraryManagementSystem_Ambalantota_PS",
        rawName: "LibraryManagementSystem_Ambalantota_PS",
        description: "A desktop-based Library Management System built with Electron.js and PostgreSQL (Neon Tech) for Ambalantota Pradeshiya Sabha.",
        isPrivate: true,
    },
    { title: "Portfolio", technology: "MERN Stack | Next.js", url: "https://github.com/AMunasinghe2001/My_PortFolio", image: portfolio, isPrivate: false },
    { title: "Hotel Booking", technology: "PHP | JavaScript | CSS | SQL", url: "https://github.com/AMunasinghe2001/hotelBookingSystem", image: hotelbook, isPrivate: false },
    { title: "Task Master App", technology: "XML | Kotlin", url: "https://github.com/AMunasinghe2001/TaskMasterApp", image: todo, isPrivate: false },
    { title: "Game App", technology: "XML | Kotlin", url: "https://github.com/AMunasinghe2001/Game_App", image: game, isPrivate: false },
    { title: "Travel Booking Web", technology: "JSP | Java | SQL", url: "https://github.com/AMunasinghe2001/Book-Tour-website-OOP", image: oop, isPrivate: false },
    { title: "Furniture Manage Web App", technology: "MERN Stack", url: "https://github.com/it22606006/Rukshan-Furniture", image: itp, isPrivate: false },
    { title: "Pet Care App", technology: "XML | Kotlin", url: "", image: mad, isPrivate: false },
    { title: "Rukshan Furniture Web", technology: "MERN Stack | Vite", url: "https://github.com/Bashitha-Weerapperuma/Rukshan-furniture-demo", image: rukshan, isPrivate: false },
    { title: "Share Me Web", technology: "React | Spring Boot", url: "https://github.com/oshanLahiru0307/Share_me-App", image: paf, isPrivate: false },
    { title: "Home Stock Web App", technology: "MERN Stack", url: "https://github.com/oshanLahiru0307/ITPM_Project", image: itpm, isPrivate: false },
];

const isDisplayable = (src) => typeof src === "string" && /^(https?:|\/|data:)/.test(src);

function Project() {
    const [projects, setProjects] = useState(fallbackProjects);
    const [selected, setSelected] = useState(null);
    const [readme, setReadme] = useState(null);
    const [readmeLoading, setReadmeLoading] = useState(false);

    useEffect(() => {
        // Try fetching live GitHub projects first
        api.get('/github-projects')
            .then((res) => {
                const data = res.data?.projects;
                if (Array.isArray(data) && data.length) {
                    setProjects(data);
                    return;
                }
                // Fallback to /projects
                return api.get('/projects').then((pRes) => {
                    const pData = pRes.data?.projects;
                    if (Array.isArray(pData) && pData.length) setProjects(pData);
                });
            })
            .catch(() => {
                api.get('/projects')
                    .then((res) => {
                        const data = res.data?.projects;
                        if (Array.isArray(data) && data.length) setProjects(data);
                    })
                    .catch((err) => {
                        console.error("Projects fetch failed", err);
                    });
            });
    }, []);

    // Fetch repository README when modal is opened
    useEffect(() => {
        if (!selected) {
            setReadme(null);
            setReadmeLoading(false);
            return;
        }

        const repoSlug = selected.repoName || selected.rawName || selected.title;
        setReadmeLoading(true);
        setReadme(null);

        api.get(`/github-projects/readme?repo=${encodeURIComponent(repoSlug)}`)
            .then((res) => {
                if (res.data?.content) {
                    setReadme(res.data.content);
                }
            })
            .catch(() => {
                // If backend endpoint is not yet reachable, try direct GitHub API if public/configured
                const fullName = repoSlug.includes('/') ? repoSlug : `AMunasinghe2001/${repoSlug}`;
                fetch(`https://api.github.com/repos/${fullName}/readme`, {
                    headers: { Accept: "application/vnd.github.raw+json" }
                })
                .then(r => r.ok ? r.text() : null)
                .then(txt => { if (txt) setReadme(txt); })
                .catch(() => {});
            })
            .finally(() => {
                setReadmeLoading(false);
            });
    }, [selected]);

    // Reveal cards on scroll via IntersectionObserver
    useEffect(() => {
        const cards = document.querySelectorAll('.project-card');
        if (!cards.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const idx = Array.from(cards).indexOf(entry.target);
                        entry.target.style.transitionDelay = `${Math.min(idx, 8) * 80}ms`;
                        entry.target.classList.add('in-view');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
        );

        cards.forEach((c) => observer.observe(c));
        return () => observer.disconnect();
    }, [projects]);

    // While popup is open: lock page scroll and close on Escape
    useEffect(() => {
        if (!selected) return;
        const onKey = (e) => { if (e.key === 'Escape') setSelected(null); };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [selected]);

    return (
        <div id="project">
            <div className="projectContainer">
                <div className='hedder animated-text'>
                    <h1 className='Project'>Latest</h1>
                    <h1 className='Dashboard'>Project</h1>
                </div>
                <div className="projectsGrid">
                    {projects.map((project, i) => (
                        <div
                            className="project-card"
                            key={project._id || project.id || i}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelected(project)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setSelected(project);
                                }
                            }}
                            aria-label={`View details for ${project.title}`}
                        >
                            {project.isPrivate && (
                                <div style={{
                                    position: 'absolute',
                                    top: 10,
                                    left: 10,
                                    zIndex: 2,
                                    background: 'rgba(234, 88, 12, 0.85)',
                                    color: '#fff',
                                    padding: '4px 10px',
                                    borderRadius: 999,
                                    fontSize: '0.72rem',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                }}>
                                    <FaLock size={10} /> Private
                                </div>
                            )}

                            {isDisplayable(project.image) ? (
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="project-image"
                                />
                            ) : (
                                <div style={{
                                    height: 180,
                                    background: 'linear-gradient(135deg, #032c2f, #0296a0)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#7ef9ff',
                                    fontSize: '2.5rem',
                                    fontWeight: 'bold'
                                }}>
                                    {project.title?.charAt(0) || "P"}
                                </div>
                            )}

                            <div className="project-card-content">
                                <h1 className='PCCtitle animated-text'>{project.title}</h1>
                                <h2 className='PCCtitle'>Technology: {project.technology}</h2>
                                <span className="project-view-hint">
                                    <FaLink size={18} /> View details & README
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selected && (
                <div
                    className="project-modal-overlay"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="project-modal"
                        style={{ maxWidth: 780, maxHeight: '88vh' }}
                        role="dialog"
                        aria-modal="true"
                        aria-label={selected.title}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="project-modal-close"
                            onClick={() => setSelected(null)}
                            aria-label="Close"
                        >
                            <FaTimes />
                        </button>

                        {isDisplayable(selected.image) && (
                            <img
                                src={selected.image}
                                alt={selected.title}
                                className="project-modal-image"
                            />
                        )}

                        <div className="project-modal-body">
                            <h2 className="project-modal-title">{selected.title}</h2>
                            <p className="project-modal-tech">
                                {selected.technology} {selected.isPrivate ? "• (Private Repository)" : ""}
                            </p>

                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                color: '#0ad0dc',
                                background: 'rgba(10, 208, 220, 0.12)',
                                border: '1px solid rgba(10, 208, 220, 0.3)',
                                padding: '4px 10px',
                                borderRadius: 999,
                                marginBottom: 16
                            }}>
                                <FaBookOpen /> Project Overview & README
                            </div>

                            {readmeLoading ? (
                                <p style={{ color: '#0ad0dc', fontStyle: 'italic', margin: '20px 0' }}>
                                    Loading README.md from GitHub...
                                </p>
                            ) : readme ? (
                                <div style={{ maxHeight: '48vh', overflowY: 'auto', paddingRight: 8, marginBottom: 20 }}>
                                    <MarkdownRenderer
                                        content={readme}
                                        repoFullName={selected.repoName || (selected.rawName ? `AMunasinghe2001/${selected.rawName}` : undefined)}
                                    />
                                </div>
                            ) : (
                                <p className="project-modal-desc">
                                    {selected.description || "No description added yet."}
                                </p>
                            )}

                            <div className="project-modal-actions">
                                {selected.url && (
                                    <a
                                        className="project-modal-btn github"
                                        href={selected.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <FaGithub /> View on GitHub
                                    </a>
                                )}
                                {selected.liveUrl && (
                                    <a
                                        className="project-modal-btn live"
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
        </div>
    );
}

export default Project;
