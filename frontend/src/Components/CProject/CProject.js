import React from 'react';

function CProject({ project }) {
    const { title, technology, url } = project;
    return (
        <div>
            <h1>Title: {title}</h1>
            <h1>Technology: {technology}</h1>
            <h1>URL: {url}</h1>
        </div>
    );
}

export default CProject;
