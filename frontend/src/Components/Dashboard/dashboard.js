import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import AdminNav from '../Admin/AdminNav';
import '../Admin/admin.css';

const ProjectsManager = () => {
    const [projects, setProjects] = useState([]);
    const [msg, setMsg] = useState(null);
    const navigate = useNavigate();

    const load = () => {
        api.get('/projects')
            .then((res) => setProjects((res.data.projects || []).slice().reverse()))
            .catch(() => setMsg({ type: 'error', text: 'Failed to load projects.' }));
    };
    useEffect(load, []);

    const remove = async (p) => {
        if (!window.confirm(`Delete project "${p.title}"?`)) return;
        try {
            await api.delete(`/projects/${p._id}`);
            load();
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Delete failed.' });
        }
    };

    return (
        <div className="admin-page">
            <AdminNav />
            <div className="admin-container">
                <h1 className="admin-title">Projects</h1>
                {msg && <div className={`admin-msg ${msg.type}`}>{msg.text}</div>}
                <button className="btn btn-primary" style={{ marginBottom: 20 }}
                    onClick={() => navigate('/admin/projects/new')}>
                    + Add Project
                </button>
                <div className="admin-cards">
                    {projects.map((p) => (
                        <div key={p._id} className="admin-card" style={{ cursor: 'default' }}>
                            {p.image && (
                                <img src={p.image} alt={p.title}
                                    style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }} />
                            )}
                            <h3>{p.title}</h3>
                            <p>Tech: {p.technology}</p>
                            {p.url && (
                                <p style={{ wordBreak: 'break-all' }}>
                                    <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0ad0dc' }}>View ↗</a>
                                </p>
                            )}
                            <div className="admin-row-actions" style={{ marginTop: 10 }}>
                                <button className="btn btn-secondary btn-sm"
                                    onClick={() => navigate(`/admin/projects/${p._id}/edit`)}>Edit</button>
                                <button className="btn btn-danger btn-sm" onClick={() => remove(p)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProjectsManager;
