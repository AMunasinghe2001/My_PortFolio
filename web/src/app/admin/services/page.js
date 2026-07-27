"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { ICON_KEYS, renderServiceIcon } from "@/lib/serviceIcons";
import {
  PageHeader,
  Message,
  Panel,
  Row,
  RowActions,
  SectionLabel,
  Empty,
} from "@/components/admin/ui";
import styles from "./services.module.css";

const BLANK = { title: "", description: "", icon: "FaLaptopCode" };

/* Icon picker: the live glyph next to the key list, so the choice is visible. */
function IconSelect({ id, value, onChange }) {
  return (
    <div className={styles.iconRow}>
      <span className={styles.iconPreview} aria-hidden="true">
        {renderServiceIcon(value)}
      </span>
      <select id={id} value={value} onChange={onChange}>
        {ICON_KEYS.map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ServicesEditorPage() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState(BLANK);
  const [msg, setMsg] = useState(null);

  const load = useCallback(() => {
    api
      .get("/services")
      .then((res) => setItems(res.data?.services || []))
      .catch(() => setMsg({ type: "error", text: "Failed to load services." }));
  }, []);

  useEffect(load, [load]);

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
      setNewItem(BLANK);
      load();
      setMsg({ type: "success", text: "Service added." });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Add failed." });
    }
  };

  return (
    <>
      <PageHeader title="Services" subtitle="The service cards shown on your site." />
      <Message msg={msg} />

      <Panel title="Add a service" as="form" onSubmit={add}>
        <div className="field">
          <label htmlFor="sTitle">Title</label>
          <input
            id="sTitle"
            type="text"
            value={newItem.title}
            onChange={(e) => setNewItem((n) => ({ ...n, title: e.target.value }))}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="sDesc">Description</label>
          <textarea
            id="sDesc"
            value={newItem.description}
            onChange={(e) => setNewItem((n) => ({ ...n, description: e.target.value }))}
          />
        </div>
        <div className="field">
          <label htmlFor="sIcon">Icon</label>
          <IconSelect
            id="sIcon"
            value={newItem.icon}
            onChange={(e) => setNewItem((n) => ({ ...n, icon: e.target.value }))}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Add Service
        </button>
      </Panel>

      <SectionLabel>Service cards</SectionLabel>

      {items.length === 0 ? (
        <div className="glass">
          <Empty>No services yet.</Empty>
        </div>
      ) : (
        items.map((item) => (
          <Row key={item._id}>
            <div className="field">
              <label>Title</label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => editRow(item._id, "title", e.target.value)}
              />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea
                value={item.description || ""}
                onChange={(e) => editRow(item._id, "description", e.target.value)}
              />
            </div>
            <div className="field">
              <label>Icon</label>
              <IconSelect
                value={item.icon}
                onChange={(e) => editRow(item._id, "icon", e.target.value)}
              />
            </div>
            <RowActions>
              <button className="btn btn-success btn-sm" onClick={() => saveRow(item)}>
                Save
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => removeRow(item)}>
                Delete
              </button>
            </RowActions>
          </Row>
        ))
      )}
    </>
  );
}
