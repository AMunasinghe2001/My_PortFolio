import React from 'react';
import './CProject.css';

function CProject({ project }) {
    const { title, technology, url } = project;
    return (
        <div className="project-card-content">
            <h2>Title: {title}</h2>
            <h2>Technology: {technology}</h2>
            <h3>URL: <a href={url} target="_blank" rel="noopener noreferrer">{url}</a></h3>
        </div>
    );
}

export default CProject;
