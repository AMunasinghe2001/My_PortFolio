"use client";

import { useCallback, useEffect, useState } from "react";
import { FaGripVertical } from "react-icons/fa";
import api from "@/lib/api";
import {
  PageHeader,
  Message,
  Panel,
  Grid2,
  Row,
  RowActions,
  SectionLabel,
  Empty,
} from "@/components/admin/ui";
import styles from "./journey.module.css";

const BLANK = { title: "", duration: "", institution: "" };

export default function JourneyEditorPage() {
  const [items, setItems] = useState([]);
  const [logoFiles, setLogoFiles] = useState({}); // { [id]: File }
  const [newItem, setNewItem] = useState(BLANK);
  const [newLogo, setNewLogo] = useState(null);
  const [msg, setMsg] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);

  const load = useCallback(() => {
    api
      .get("/journey")
      .then((res) => setItems(res.data?.journey || []))
      .catch(() => setMsg({ type: "error", text: "Failed to load journey." }));
  }, []);

  useEffect(load, [load]);

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
      fd.append("order", items.length); // new entries go to the end
      if (newLogo) fd.append("logo", newLogo);
      await api.post("/journey", fd);
      setNewItem(BLANK);
      setNewLogo(null);
      e.target.reset();
      load();
      setMsg({ type: "success", text: "Journey item added." });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Add failed." });
    }
  };

  // ---- Drag & drop reordering ----
  const onDrop = async (targetIndex) => {
    const from = dragIndex;
    setDragIndex(null);
    if (from === null || from === targetIndex) return;

    const reordered = [...items];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(targetIndex, 0, moved);
    setItems(reordered); // optimistic

    try {
      await api.put("/journey/reorder", { ids: reordered.map((i) => i._id) });
      setMsg({ type: "success", text: "Order updated." });
    } catch {
      setMsg({ type: "error", text: "Reorder failed." });
      load(); // revert to server order
    }
  };

  return (
    <>
      <PageHeader title="Journey" subtitle="Education and milestones on your timeline." />
      <Message msg={msg} />

      <Panel title="Add a journey entry" as="form" onSubmit={add}>
        <div className="field">
          <label htmlFor="jTitle">Title</label>
          <input
            id="jTitle"
            type="text"
            value={newItem.title}
            onChange={(e) => setNewItem((n) => ({ ...n, title: e.target.value }))}
            placeholder="Degree or course name"
            required
          />
        </div>
        <Grid2>
          <div className="field">
            <label htmlFor="jDuration">Duration</label>
            <input
              id="jDuration"
              type="text"
              value={newItem.duration}
              onChange={(e) => setNewItem((n) => ({ ...n, duration: e.target.value }))}
              placeholder="2022 - Present"
            />
          </div>
          <div className="field">
            <label htmlFor="jInstitution">Institution</label>
            <input
              id="jInstitution"
              type="text"
              value={newItem.institution}
              onChange={(e) => setNewItem((n) => ({ ...n, institution: e.target.value }))}
            />
          </div>
        </Grid2>
        <div className="field">
          <label htmlFor="jLogo">Logo</label>
          <input
            id="jLogo"
            type="file"
            accept="image/*"
            onChange={(e) => setNewLogo(e.target.files[0])}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Add Entry
        </button>
      </Panel>

      <SectionLabel>Entries — drag to reorder (top shows first)</SectionLabel>

      {items.length === 0 ? (
        <div className="glass">
          <Empty>No journey entries yet.</Empty>
        </div>
      ) : (
        items.map((item, index) => (
          <Row
            key={item._id}
            className={dragIndex === index ? styles.dragging : ""}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(index)}
          >
            <div
              className={styles.handle}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragEnd={() => setDragIndex(null)}
              title="Drag to reorder"
              aria-label="Drag to reorder"
            >
              <FaGripVertical />
            </div>

            <div className="field">
              <label>Title</label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => editRow(item._id, "title", e.target.value)}
              />
            </div>

            <Grid2>
              <div className="field">
                <label>Duration</label>
                <input
                  type="text"
                  value={item.duration || ""}
                  onChange={(e) => editRow(item._id, "duration", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Institution</label>
                <input
                  type="text"
                  value={item.institution || ""}
                  onChange={(e) => editRow(item._id, "institution", e.target.value)}
                />
              </div>
            </Grid2>

            <div className="field">
              <label>Logo</label>
              <div className={styles.logoRow}>
                {item.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.logo} alt="" className={styles.logo} />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setLogoFiles((m) => ({ ...m, [item._id]: e.target.files[0] }))
                  }
                />
              </div>
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
