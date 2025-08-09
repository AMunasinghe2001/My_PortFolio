import React from 'react';
import './projects.css';
import { FaLink } from 'react-icons/fa';
import projectImage1 from './img/portfolio.jpg';
import projectImage2 from './img/hotelbook.jpg';
import projectImage3 from './img/todo app.jpg';
import projectImage4 from './img/game app.jpg';
import projectImage5 from './img/itp.jpg';
import projectImage6 from './img/mad.jpg';
import projectImage7 from './img/oop.jpg';
import projectImage8 from './img/rukshanferniture.jpg';
import projectImage9 from './img/PAF.png';
import projectImage10 from './img/ITPM.png';

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
        url: "https://github.com/AMunasinghe2001/hotelBookingSystem",
        image: projectImage2,
    },
    {
        id: 3,
        title: "Task Master App",
        technology: "Kotlin",
        url: "https://github.com/AMunasinghe2001/TaskMasterApp",
        image: projectImage3,
    },
    {
        id: 4,
        title: "Game App",
        technology: "Kotlin",
        url: "https://github.com/AMunasinghe2001/Game_App",
        image: projectImage4,
    },
    {
        id: 5,
        title: "Furniture Manage Web App",
        technology: "MERN Stack",
        url: "https://github.com/it22606006/Rukshan-Furniture",
        image: projectImage5,
    },
    {
        id: 6,
        title: "Pet Care App",
        technology: "Kotlin",
        url: "",
        image: projectImage6,
    },
    {
        id: 7,
        title: "Travel Booking Web",
        technology: "Java,JavaScript,CSS,SQL",
        url: "https://github.com/AMunasinghe2001/Book-Tour-website-OOP",
        image: projectImage7,
    },
    {
        id: 8,
        title: "Rukshan Furniture Web",
        technology: "MERN Stack,Vite+React",
        url: "https://github.com/Bashitha-Weerapperuma/Rukshan-furniture-demo",
        image: projectImage8,
    },
    {
        id: 9,
        title: "Share me Web",
        technology: "React,Java",
        url: "https://github.com/oshanLahiru0307/Share_me-App",
        image: projectImage9,
    },
    {
        id: 10,
        title: "Home Stock Web App",
        technology: "MERN Stack",
        url: "https://github.com/oshanLahiru0307/ITPM_Project",
        image: projectImage10,
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
