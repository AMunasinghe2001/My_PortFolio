import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminNav from "./AdminNav";
import "./admin.css";

const blankNew = { title: "", duration: "", institution: "" };

const JourneyEditor = () => {
  const [items, setItems] = useState([]);
  const [logoFiles, setLogoFiles] = useState({}); // { [id]: File }
  const [newItem, setNewItem] = useState(blankNew);
  const [newLogo, setNewLogo] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = () => {
    api
      .get("/journey")
      .then((res) => setItems(res.data.journey || []))
      .catch(() => setMsg({ type: "error", text: "Failed to load journey." }));
  };
  useEffect(load, []);

  const editRow = (id, field, value) =>
    setItems((list) => list.map((i) => (i._id === id ? { ...i, [field]: value } : i)));

  const saveRow = async (item) => {
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("title", item.title);
      fd.append("duration", item.duration || "");
      fd.append("institution", item.institution || "");
      if (logoFiles[item._id]) fd.append("logo", logoFiles[item._id]);
      await api.put(`/journey/${item._id}`, fd);
      setLogoFiles((m) => ({ ...m, [item._id]: null }));
      setMsg({ type: "success", text: `Saved "${item.title}".` });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Save failed." });
    }
  };

  const removeRow = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      await api.delete(`/journey/${item._id}`);
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Delete failed." });
    }
  };

  const add = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("title", newItem.title);
      fd.append("duration", newItem.duration);
      fd.append("institution", newItem.institution);
      if (newLogo) fd.append("logo", newLogo);
      await api.post("/journey", fd);
      setNewItem(blankNew);
      setNewLogo(null);
      e.target.reset();
      load();
      setMsg({ type: "success", text: "Journey item added." });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Add failed." });
    }
  };

  return (
    <div className="admin-page">
      <AdminNav />
      <div className="admin-container">
        <h1 className="admin-title">Journey</h1>
        {msg && <div className={`admin-msg ${msg.type}`}>{msg.text}</div>}

        <form className="admin-form" onSubmit={add}>
          <h2>Add a journey entry</h2>
          <div className="admin-field">
            <label>Title (e.g. degree / course)</label>
            <input type="text" value={newItem.title}
              onChange={(e) => setNewItem((n) => ({ ...n, title: e.target.value }))} required />
          </div>
          <div className="admin-grid-2">
            <div className="admin-field">
              <label>Duration (e.g. 2022 - Present)</label>
              <input type="text" value={newItem.duration}
                onChange={(e) => setNewItem((n) => ({ ...n, duration: e.target.value }))} />
            </div>
            <div className="admin-field">
              <label>Institution</label>
              <input type="text" value={newItem.institution}
                onChange={(e) => setNewItem((n) => ({ ...n, institution: e.target.value }))} />
            </div>
          </div>
          <div className="admin-field">
            <label>Logo</label>
            <input type="file" accept="image/*" onChange={(e) => setNewLogo(e.target.files[0])} />
          </div>
          <button type="submit" className="btn btn-primary">Add Entry</button>
        </form>

        <h3 className="admin-section-label">Entries (top = shown first)</h3>
        <div className="admin-list">
          {items.map((item) => (
            <div key={item._id} className="admin-row">
              <div className="admin-field" style={{ margin: 0 }}>
                <label>Title</label>
                <input type="text" value={item.title} onChange={(e) => editRow(item._id, "title", e.target.value)} />
              </div>
              <div className="admin-grid-2">
                <div className="admin-field" style={{ margin: 0 }}>
                  <label>Duration</label>
                  <input type="text" value={item.duration || ""} onChange={(e) => editRow(item._id, "duration", e.target.value)} />
                </div>
                <div className="admin-field" style={{ margin: 0 }}>
                  <label>Institution</label>
                  <input type="text" value={item.institution || ""} onChange={(e) => editRow(item._id, "institution", e.target.value)} />
                </div>
              </div>
              <div className="admin-field" style={{ margin: 0 }}>
                <label>Logo</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {item.logo && <img src={item.logo} alt="logo" className="admin-thumb" />}
                  <input type="file" accept="image/*"
                    onChange={(e) => setLogoFiles((m) => ({ ...m, [item._id]: e.target.files[0] }))} />
                </div>
              </div>
              <div className="admin-row-actions">
                <button className="btn btn-success btn-sm" onClick={() => saveRow(item)}>Save</button>
                <button className="btn btn-danger btn-sm" onClick={() => removeRow(item)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JourneyEditor;
