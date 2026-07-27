"use client";

import { useCallback, useEffect, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
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
import styles from "./skills.module.css";

const BLANK = { title: "", percentage: 80, category: "tool" };

export default function SkillsEditorPage() {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState(BLANK);
  const [msg, setMsg] = useState(null);

  const load = useCallback(() => {
    api
      .get("/skills")
      .then((res) => setSkills(res.data?.skills || []))
      .catch(() => setMsg({ type: "error", text: "Failed to load skills." }));
  }, []);

  useEffect(load, [load]);

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
      setNewSkill(BLANK);
      load();
      setMsg({ type: "success", text: "Skill added." });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Add failed." });
    }
  };

  const renderGroup = (category, label) => {
    const rows = skills.filter((s) => s.category === category);
    return (
      <>
        <SectionLabel>{label}</SectionLabel>
        {rows.length === 0 ? (
          <div className="glass">
            <Empty>Nothing here yet.</Empty>
          </div>
        ) : (
          rows.map((s) => (
            <Row key={s._id}>
              <Grid2>
                <div className="field">
                  <label>Title</label>
                  <input
                    type="text"
                    value={s.title}
                    onChange={(e) => editRow(s._id, "title", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Percentage</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={s.percentage}
                    onChange={(e) => editRow(s._id, "percentage", e.target.value)}
                  />
                </div>
              </Grid2>
              <RowActions>
                <button className="btn btn-success btn-sm" onClick={() => saveRow(s)}>
                  Save
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => removeRow(s)}>
                  Delete
                </button>
              </RowActions>
            </Row>
          ))
        )}
      </>
    );
  };

  return (
    <>
      <PageHeader title="Skills" subtitle="Manually managed skill bars." />
      <Message msg={msg} />

      <Panel title="Add a skill" as="form" onSubmit={add}>
        <Grid2>
          <div className="field">
            <label htmlFor="newTitle">Title</label>
            <input
              id="newTitle"
              type="text"
              value={newSkill.title}
              onChange={(e) => setNewSkill((n) => ({ ...n, title: e.target.value }))}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="newPct">Percentage</label>
            <input
              id="newPct"
              type="number"
              min="0"
              max="100"
              value={newSkill.percentage}
              onChange={(e) => setNewSkill((n) => ({ ...n, percentage: e.target.value }))}
              required
            />
          </div>
        </Grid2>
        <div className="field">
          <label htmlFor="newCat">Category</label>
          <select
            id="newCat"
            value={newSkill.category}
            onChange={(e) => setNewSkill((n) => ({ ...n, category: e.target.value }))}
          >
            <option value="tool">Tool</option>
            <option value="professional">Professional</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Add Skill
        </button>
      </Panel>

      <div className={styles.notice}>
        <FaInfoCircle />
        <span>
          Technical Skills and Database Management are generated automatically from your
          GitHub repositories — they are not edited here. Only Tools and Professional
          skills below are managed manually.
        </span>
      </div>

      {renderGroup("tool", "Tools")}
      {renderGroup("professional", "Professional Skills")}
    </>
  );
}
