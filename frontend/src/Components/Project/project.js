import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './project.css';
import { FaLink } from 'react-icons/fa';

const URL = "https://my-port-folio-livid.vercel.app/projects";

const fetchHandler = async () => {
    return await axios.get(URL).then((res) => res.data);
}

function Project() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHandler().then((data) => {
            setProjects(data.projects);
            setLoading(false); // Stop loading animation once data is fetched
        }).catch((error) => {
            console.error("There was an error fetching the projects!", error);
            setLoading(false); // Stop loading animation even if there's an error
        });
    }, []);

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

    const interleavedProjects = getInterleavedProjects(projects);

    return (
        <div id="project">
            <div className="projectContainer">
                <div className='hedder animated-text'>
                    <h1 className='Project'>Latest</h1>
                    <h1 className='Dashboard'>Project</h1>
                </div>
                <div className="projectsGrid">
                {loading && (
                        <div className="small-loader-container">
                            <div className="small-loader"></div>
                        </div>
                    )}
                    {!loading && interleavedProjects && interleavedProjects.map((project, i) => (
                        <div className="project-card" key={i}>
                            <img 
                                src={`https://my-port-folio-livid.vercel.app/uploads/${project.image}`} 
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
