import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import AdminNav from "../Admin/AdminNav";
import "../Admin/admin.css";

function UpdateProject() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({ title: "", technology: "", url: "", liveUrl: "", description: "" });
    const [currentImage, setCurrentImage] = useState("");
    const [image, setImage] = useState(null);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        api.get(`/projects/${id}`)
            .then((res) => {
                const project = res.data.project;
                setInputs({
                    title: project.title || "",
                    technology: project.technology || "",
                    url: project.url || "",
                    liveUrl: project.liveUrl || "",
                    description: project.description || "",
                });
                setCurrentImage(project.image || "");
            })
            .catch(() => setMsg({ type: "error", text: "Failed to load project." }));
    }, [id]);

    const handleChange = (e) =>
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg(null);
        const formData = new FormData();
        formData.append("title", inputs.title);
        formData.append("technology", inputs.technology);
        formData.append("url", inputs.url);
        formData.append("liveUrl", inputs.liveUrl);
        formData.append("description", inputs.description);
        if (image) formData.append("image", image);
        try {
            await api.put(`/projects/${id}`, formData);
            navigate("/admin/projects");
        } catch (error) {
            setMsg({ type: "error", text: error.response?.data?.message || "Failed to update project." });
            setSaving(false);
        }
    };

    return (
        <div className="admin-page">
            <AdminNav />
            <div className="admin-container">
                <button className="admin-back" onClick={() => navigate("/admin/projects")}>← Back to projects</button>
                <h1 className="admin-title">Update Project</h1>
                {msg && <div className={`admin-msg ${msg.type}`}>{msg.text}</div>}
                <form className="admin-form" onSubmit={handleSubmit}>
                    <div className="admin-field">
                        <label>Title</label>
                        <input type="text" name="title" value={inputs.title} onChange={handleChange} required />
                    </div>
                    <div className="admin-field">
                        <label>Technology</label>
                        <input type="text" name="technology" value={inputs.technology} onChange={handleChange} required />
                    </div>
                    <div className="admin-grid-2">
                        <div className="admin-field">
                            <label>GitHub URL</label>
                            <input type="text" name="url" value={inputs.url} onChange={handleChange} placeholder="https://github.com/..." />
                        </div>
                        <div className="admin-field">
                            <label>Live website URL (optional)</label>
                            <input type="text" name="liveUrl" value={inputs.liveUrl} onChange={handleChange} placeholder="https://..." />
                        </div>
                    </div>
                    <div className="admin-field">
                        <label>Description (shown in the project popup)</label>
                        <textarea name="description" value={inputs.description} onChange={handleChange} style={{ minHeight: 120 }} />
                    </div>
                    <div className="admin-field">
                        <label>Image (leave empty to keep current)</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            {currentImage && <img src={currentImage} alt="current" className="admin-thumb" />}
                            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? "Updating…" : "Update Project"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default UpdateProject;
