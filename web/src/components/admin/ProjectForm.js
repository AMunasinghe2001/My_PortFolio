"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import api from "@/lib/api";
import { PageHeader, Message, Panel, Grid2 } from "@/components/admin/ui";
import styles from "./ProjectForm.module.css";

const BLANK = { title: "", technology: "", url: "", liveUrl: "", description: "" };

/**
 * Shared by the "Add Project" and "Edit Project" pages — the two differ only in
 * where they POST/PUT and what they start from.
 *
 * @param {"create"|"edit"} mode
 * @param {string} [projectId]     required in edit mode
 * @param {object} [initialValues] pre-filled fields in edit mode
 * @param {string} [currentImage]  existing image URL in edit mode
 */
export default function ProjectForm({
  mode,
  projectId,
  initialValues,
  currentImage = "",
}) {
  const isEdit = mode === "edit";
  const router = useRouter();
  const [inputs, setInputs] = useState({ ...BLANK, ...initialValues });
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const change = (e) =>
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const fd = new FormData();
    fd.append("title", inputs.title);
    fd.append("technology", inputs.technology);
    fd.append("url", inputs.url);
    fd.append("liveUrl", inputs.liveUrl);
    fd.append("description", inputs.description);
    if (image) fd.append("image", image);

    try {
      if (isEdit) {
        await api.put(`/projects/${projectId}`, fd);
      } else {
        await api.post("/projects", fd);
      }
      router.push("/admin/projects");
      router.refresh();
    } catch (err) {
      setMsg({
        type: "error",
        text:
          err.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "add"} project.`,
      });
      setSaving(false);
    }
  };

  return (
    <>
      <Link href="/admin/projects" className={styles.back}>
        <FaArrowLeft /> Back to projects
      </Link>

      <PageHeader title={isEdit ? "Update Project" : "Add Project"} />
      <Message msg={msg} />

      <form onSubmit={submit}>
        <Panel>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input id="title" type="text" name="title" value={inputs.title} onChange={change} required />
          </div>

          <div className="field">
            <label htmlFor="technology">Technology</label>
            <input
              id="technology"
              type="text"
              name="technology"
              value={inputs.technology}
              onChange={change}
              placeholder="MERN Stack | React | Kotlin…"
              required
            />
          </div>

          <Grid2>
            <div className="field">
              <label htmlFor="url">GitHub URL</label>
              <input id="url" type="text" name="url" value={inputs.url} onChange={change} placeholder="https://github.com/…" />
            </div>
            <div className="field">
              <label htmlFor="liveUrl">Live website URL</label>
              <input id="liveUrl" type="text" name="liveUrl" value={inputs.liveUrl} onChange={change} placeholder="https://… (optional)" />
            </div>
          </Grid2>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={inputs.description}
              onChange={change}
              style={{ minHeight: 130 }}
            />
            <span className="hint">Shown in the project popup on the public site.</span>
          </div>

          <div className="field">
            <label>Image</label>
            <div className={styles.imageRow}>
              {currentImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentImage} alt="Current" className={styles.thumb} />
              )}
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
            </div>
            {isEdit && <span className="hint">Leave empty to keep the current image.</span>}
          </div>
        </Panel>

        <div className={styles.actions}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving
              ? isEdit
                ? "Updating…"
                : "Adding…"
              : isEdit
                ? "Update Project"
                : "Add Project"}
          </button>
          <Link href="/admin/projects" className="btn btn-glass">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
