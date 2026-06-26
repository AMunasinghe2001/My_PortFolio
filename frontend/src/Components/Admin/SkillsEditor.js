import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminNav from "./AdminNav";
import "./admin.css";

const blankNew = { title: "", percentage: 80, category: "technical" };

const SkillsEditor = () => {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState(blankNew);
  const [msg, setMsg] = useState(null);

  const load = () => {
    api
      .get("/skills")
      .then((res) => setSkills(res.data.skills || []))
      .catch(() => setMsg({ type: "error", text: "Failed to load skills." }));
  };
  useEffect(load, []);

  const editRow = (id, field, value) =>
    setSkills((list) => list.map((s) => (s._id === id ? { ...s, [field]: value } : s)));

  const saveRow = async (skill) => {
    setMsg(null);
    try {
      await api.put(`/skills/${skill._id}`, {
        title: skill.title,
        percentage: Number(skill.percentage),
        category: skill.category,
      });
      setMsg({ type: "success", text: `Saved "${skill.title}".` });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Save failed." });
    }
  };

  const removeRow = async (skill) => {
    if (!window.confirm(`Delete skill "${skill.title}"?`)) return;
    try {
      await api.delete(`/skills/${skill._id}`);
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Delete failed." });
    }
  };

  const add = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.post("/skills", { ...newSkill, percentage: Number(newSkill.percentage) });
      setNewSkill(blankNew);
      load();
      setMsg({ type: "success", text: "Skill added." });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Add failed." });
    }
  };

  const renderGroup = (category, label) => (
    <>
      <h3 className="admin-section-label">{label}</h3>
      <div className="admin-list">
        {skills.filter((s) => s.category === category).map((s) => (
          <div key={s._id} className="admin-row">
            <div className="admin-grid-2">
              <div className="admin-field" style={{ margin: 0 }}>
                <label>Title</label>
                <input type="text" value={s.title} onChange={(e) => editRow(s._id, "title", e.target.value)} />
              </div>
              <div className="admin-field" style={{ margin: 0 }}>
                <label>Percentage</label>
                <input type="number" min="0" max="100" value={s.percentage}
                  onChange={(e) => editRow(s._id, "percentage", e.target.value)} />
              </div>
            </div>
            <div className="admin-row-actions">
              <button className="btn btn-success btn-sm" onClick={() => saveRow(s)}>Save</button>
              <button className="btn btn-danger btn-sm" onClick={() => removeRow(s)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="admin-page">
      <AdminNav />
      <div className="admin-container">
        <h1 className="admin-title">Skills</h1>
        {msg && <div className={`admin-msg ${msg.type}`}>{msg.text}</div>}

        {/* Add form */}
        <form className="admin-form" onSubmit={add}>
          <h2>Add a skill</h2>
          <div className="admin-grid-2">
            <div className="admin-field">
              <label>Title</label>
              <input type="text" value={newSkill.title}
                onChange={(e) => setNewSkill((n) => ({ ...n, title: e.target.value }))} required />
            </div>
            <div className="admin-field">
              <label>Percentage</label>
              <input type="number" min="0" max="100" value={newSkill.percentage}
                onChange={(e) => setNewSkill((n) => ({ ...n, percentage: e.target.value }))} required />
            </div>
          </div>
          <div className="admin-field">
            <label>Category</label>
            <select value={newSkill.category}
              onChange={(e) => setNewSkill((n) => ({ ...n, category: e.target.value }))}>
              <option value="technical">Technical</option>
              <option value="professional">Professional</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Add Skill</button>
        </form>

        {renderGroup("technical", "Technical Skills")}
        {renderGroup("professional", "Professional Skills")}
      </div>
    </div>
  );
};

export default SkillsEditor;
