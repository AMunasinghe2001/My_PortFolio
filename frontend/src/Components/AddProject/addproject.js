import React, { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import AdminNav from "../Admin/AdminNav";
import "../Admin/admin.css";

function AddProject() {
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({ title: "", technology: "", url: "", liveUrl: "", description: "" });
    const [image, setImage] = useState(null);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);

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
            await api.post("/projects", formData);
            navigate("/admin/projects");
        } catch (error) {
            setMsg({ type: "error", text: error.response?.data?.message || "Failed to add project." });
            setSaving(false);
        }
    };

    return (
        <div className="admin-page">
            <AdminNav />
            <div className="admin-container">
                <button className="admin-back" onClick={() => navigate("/admin/projects")}>← Back to projects</button>
                <h1 className="admin-title">Add Project</h1>
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
                        <label>Image</label>
                        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? "Adding…" : "Add Project"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddProject;
