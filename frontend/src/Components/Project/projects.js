import React from 'react';
import './projects.css';
import { FaLink } from 'react-icons/fa';
import projectImage1 from './img/portfolio.jpg';
import projectImage2 from './img/hotelbook.jpg';

const projectData = [
    {
        id: 1,
        title: "Portfolio",
        technology: "MERN Stack",
        url: "https://github.com/AMunasinghe2001/My_PortFolio",
        image: projectImage1,
    },
    {
        id: 2,
        title: "Hottel Booking",
        technology: "PHP,JavaScript,CSS,SQL",
        url: "https://https://github.com/AMunasinghe2001/hotelBookingSystem",
        image: projectImage2,
    },
    
];

// Function to interleave the projects starting from the middle
const getInterleavedProjects = (projects) => {
    const interleaved = [];
    const middle = Math.floor(projects.length / 2);
    let left = middle - 1;
    let right = middle;

    while (left >= 0 || right < projects.length) {
        if (right < projects.length) {
            interleaved.push(projects[right]);
            right++;
        }
        if (left >= 0) {
            interleaved.push(projects[left]);
            left--;
        }
    }
    return interleaved;
};

const Project = () => {
    const interleavedProjects = getInterleavedProjects(projectData);

    return (
        <div id="project">
            <div className="projectContainer">
                <div className='hedder animated-text'>
                    <h1 className='Project'>Latest</h1>
                    <h1 className='Dashboard'>Project</h1>
                </div>
                <div className="projectsGrid">
                    {interleavedProjects && interleavedProjects.map((project, i) => (
                        <div className="project-card" key={i}>
                            <img 
                                src={project.image} 
                                alt={project.title} 
                                className="project-image" 
                            />
                            <div className="project-card-content">
                                <h1 className='PCCtitle animated-text'>{project.title}</h1>
                                <h2 className='PCCtitle'>Technology: {project.technology}</h2>
                                <div className='url'>
                                    <a href={project.url} target="_blank" rel="noopener noreferrer">
                                        <FaLink size={26} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Project;
