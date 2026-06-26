import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminNav from "./AdminNav";
import { iconMap, renderServiceIcon } from "../Services/services";
import "./admin.css";

const ICON_KEYS = Object.keys(iconMap);
const blankNew = { title: "", description: "", icon: "FaLaptopCode" };

const ServicesEditor = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState(blankNew);
  const [msg, setMsg] = useState(null);

  const load = () => {
    api
      .get("/services")
      .then((res) => setItems(res.data.services || []))
      .catch(() => setMsg({ type: "error", text: "Failed to load services." }));
  };
  useEffect(load, []);

  const editRow = (id, field, value) =>
    setItems((list) => list.map((i) => (i._id === id ? { ...i, [field]: value } : i)));

  const saveRow = async (item) => {
    setMsg(null);
    try {
      await api.put(`/services/${item._id}`, {
        title: item.title,
        description: item.description,
        icon: item.icon,
      });
      setMsg({ type: "success", text: `Saved "${item.title}".` });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Save failed." });
    }
  };

  const removeRow = async (item) => {
    if (!window.confirm(`Delete service "${item.title}"?`)) return;
    try {
      await api.delete(`/services/${item._id}`);
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Delete failed." });
    }
  };

  const add = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.post("/services", newItem);
      setNewItem(blankNew);
      load();
      setMsg({ type: "success", text: "Service added." });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Add failed." });
    }
  };

  const IconSelect = ({ value, onChange }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 26, color: "#0ad0dc" }}>{renderServiceIcon(value)}</span>
      <select value={value} onChange={onChange}>
        {ICON_KEYS.map((k) => (
          <option key={k} value={k}>{k}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="admin-page">
      <AdminNav />
      <div className="admin-container">
        <h1 className="admin-title">Services</h1>
        {msg && <div className={`admin-msg ${msg.type}`}>{msg.text}</div>}

        <form className="admin-form" onSubmit={add}>
          <h2>Add a service</h2>
          <div className="admin-field">
            <label>Title</label>
            <input type="text" value={newItem.title}
              onChange={(e) => setNewItem((n) => ({ ...n, title: e.target.value }))} required />
          </div>
          <div className="admin-field">
            <label>Description</label>
            <textarea value={newItem.description}
              onChange={(e) => setNewItem((n) => ({ ...n, description: e.target.value }))} />
          </div>
          <div className="admin-field">
            <label>Icon</label>
            <IconSelect value={newItem.icon}
              onChange={(e) => setNewItem((n) => ({ ...n, icon: e.target.value }))} />
          </div>
          <button type="submit" className="btn btn-primary">Add Service</button>
        </form>

        <h3 className="admin-section-label">Service cards</h3>
        <div className="admin-list">
          {items.map((item) => (
            <div key={item._id} className="admin-row">
              <div className="admin-field" style={{ margin: 0 }}>
                <label>Title</label>
                <input type="text" value={item.title} onChange={(e) => editRow(item._id, "title", e.target.value)} />
              </div>
              <div className="admin-field" style={{ margin: 0 }}>
                <label>Description</label>
                <textarea value={item.description || ""} onChange={(e) => editRow(item._id, "description", e.target.value)} />
              </div>
              <div className="admin-field" style={{ margin: 0 }}>
                <label>Icon</label>
                <IconSelect value={item.icon} onChange={(e) => editRow(item._id, "icon", e.target.value)} />
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

export default ServicesEditor;
