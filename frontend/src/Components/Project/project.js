import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import './project.css';
import { FaLink } from 'react-icons/fa';

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
                        <div className="project-card" key={project._id || i}>
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
                                {project.url && (
                                    <div className='url'>
                                        <a href={project.url} target="_blank" rel="noopener noreferrer">
                                            <FaLink size={26} />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Project;
