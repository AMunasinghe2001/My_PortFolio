import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './dashboard.css';
import CProject from '../CProject/CProject';

const URL = "http://localhost:5000/projects";

const fetchHandler = async () => {
    return await axios.get(URL).then((res) => res.data);
}

function Dashboard() {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        fetchHandler().then((data) => {
            setProjects(data.projects);
        }).catch((error) => {
            console.error("There was an error fetching the projects!", error);
        });
    }, []);

    return (
        <div className="dashboard-container">
            <h1 className='PD'>Project Dashboard</h1>
            <div className="projects-grid">
                {projects && projects.map((project, i) => (
                    <div key={i}>
                        <CProject project={project} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;
