import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import './project.css';
import { FaLink, FaGithub, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';

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
    { title: "Portfolio", technology: "MERN Stack", url: "https://github.com/AMunasinghe2001/My_PortFolio", image: portfolio },
    { title: "Hottel Booking", technology: "PHP | JavaScript | CSS | SQL", url: "https://github.com/AMunasinghe2001/hotelBookingSystem", image: hotelbook },
    { title: "Task Master App", technology: "XML | Kotlin", url: "https://github.com/AMunasinghe2001/TaskMasterApp", image: todo },
    { title: "Game App", technology: "XML | Kotlin", url: "https://github.com/AMunasinghe2001/Game_App", image: game },
    { title: "Furniture Manage Web App", technology: "MERN Stack", url: "https://github.com/it22606006/Rukshan-Furniture", image: itp },
    { title: "Pet Care App", technology: "XML | Kotlin", url: "", image: mad },
    { title: "Travel Booking Web", technology: "JSP |Java |SQL", url: "https://github.com/AMunasinghe2001/Book-Tour-website-OOP", image: oop },
    { title: "Rukshan Furniture Web", technology: "MERN Stack | Vite", url: "https://github.com/Bashitha-Weerapperuma/Rukshan-furniture-demo", image: rukshan },
    { title: "Share me Web", technology: "React | Spring Boot", url: "https://github.com/oshanLahiru0307/Share_me-App", image: paf },
    { title: "Home Stock Web App", technology: "MERN Stack", url: "https://github.com/oshanLahiru0307/ITPM_Project", image: itpm },
];

// A usable image src: a full URL, an absolute/bundled path, or a data URI.
// (Old DB records may hold a bare filename like "portfolio.jpg" — skip those
// so we show the card gradient instead of a broken-image icon.)
const isDisplayable = (src) => typeof src === "string" && /^(https?:|\/|data:)/.test(src);

// Interleave starting from the middle (keeps the original visual layout).
const getInterleavedProjects = (projects) => {
    const interleaved = [];
    const middle = Math.floor(projects.length / 2);
    let left = middle - 1;
    let right = middle;
    while (left >= 0 || right < projects.length) {
        if (right < projects.length) { interleaved.push(projects[right]); right++; }
        if (left >= 0) { interleaved.push(projects[left]); left--; }
    }
    return interleaved;
};

function Project() {
    const [projects, setProjects] = useState(fallbackProjects);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        api.get('/projects')
            .then((res) => {
                const data = res.data.projects;
                if (Array.isArray(data) && data.length) setProjects(data);
            })
            .catch((error) => {
                console.error("There was an error fetching the projects!", error);
            });
    }, []);

    // While the popup is open: lock page scroll and close on Escape.
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

    const interleavedProjects = getInterleavedProjects(projects);

    return (
        <div id="project">
            <div className="projectContainer">
                <div className='hedder animated-text'>
                    <h1 className='Project'>Latest</h1>
                    <h1 className='Dashboard'>Project</h1>
                </div>
                <div className="projectsGrid">
                    {interleavedProjects.map((project, i) => (
                        <div
                            className="project-card"
                            key={project._id || i}
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
                            {isDisplayable(project.image) && (
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="project-image"
                                />
                            )}
                            <div className="project-card-content">
                                <h1 className='PCCtitle animated-text'>{project.title}</h1>
                                <h2 className='PCCtitle'>Technology: {project.technology}</h2>
                                <span className="project-view-hint">
                                    <FaLink size={18} /> View details
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
                            <p className="project-modal-tech">{selected.technology}</p>

                            {selected.description ? (
                                <p className="project-modal-desc">{selected.description}</p>
                            ) : (
                                <p className="project-modal-desc project-modal-desc-empty">
                                    No description added yet.
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
