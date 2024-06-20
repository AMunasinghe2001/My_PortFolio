import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import './dashboard.css';

const URL = "http://localhost:5000/projects";

const fetchHandler = async () => {
    return await axios.get(URL).then((res) => res.data);
}

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHandler().then((data) => {
            setProjects(data.projects.reverse());
        }).catch((error) => {
            console.error("There was an error fetching the projects!", error);
        });
    }, []);

    const handleAddProject = () => {
        navigate('/addproject');
    };

    const handleEditProject = (id) => {
        navigate(`/updateproject/${id}`);
    };

    return (
        <div className="container">
            <div className="dashbord-title">
                <h1 className="dashbord-title1">Project</h1>
                <h1 className="dashbord-title2">Dashboard</h1>
            </div>
            <button className="btn-add" onClick={handleAddProject}>
                <FontAwesomeIcon icon={faPlus} /> Add Project
            </button>
            <div className="grid">
                {projects && projects.map((project, i) => (
                    <div key={i} className="card">
                        <div className='pic'>
                            <img src={`http://localhost:5000/uploads/${project.image}`} alt={project.title} />
                        </div>
                        <div className='dBContent'>
                            <h3>Project Name: {project.title}</h3>
                            <h3>Used Technology: {project.technology}</h3>
                            <h3>Git Hub URL: <a href={project.url} target="_blank" rel="noopener noreferrer">View Project</a></h3>
                            <button className="btn-edit" onClick={() => handleEditProject(project._id)}>
                                <FontAwesomeIcon icon={faEdit} /> Edit
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
