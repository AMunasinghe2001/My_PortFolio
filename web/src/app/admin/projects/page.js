"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FaPlus, FaExternalLinkAlt } from "react-icons/fa";
import api from "@/lib/api";
import { PageHeader, Message, Empty } from "@/components/admin/ui";
import styles from "./projects.module.css";

export default function ProjectsManagerPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const load = useCallback(() => {
    api
      .get("/projects")
      .then((res) => setProjects((res.data?.projects || []).slice().reverse()))
      .catch(() => setMsg({ type: "error", text: "Failed to load projects." }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const remove = async (p) => {
    if (!window.confirm(`Delete project "${p.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/projects/${p._id}`);
      setMsg({ type: "success", text: `Deleted "${p.title}".` });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Delete failed." });
    }
  };

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="These cards appear in the Latest Projects section."
        action={
          <Link href="/admin/projects/new" className="btn btn-primary">
            <FaPlus /> Add Project
          </Link>
        }
      />
      <Message msg={msg} />

      {loading ? (
        <Empty>Loading projects…</Empty>
      ) : projects.length === 0 ? (
        <div className="glass">
          <Empty>No projects yet — add your first one.</Empty>
        </div>
      ) : (
        <div className={styles.grid}>
          {projects.map((p) => (
            <article key={p._id} className={`glass ${styles.card}`}>
              {p.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt="" className={styles.thumb} />
              )}
              <div className={styles.body}>
                <h3 className={styles.title}>{p.title}</h3>
                <p className={styles.tech}>{p.technology}</p>

                {p.url && (
                  <a
                    className={styles.link}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub <FaExternalLinkAlt />
                  </a>
                )}

                <div className={styles.actions}>
                  <Link href={`/admin/projects/${p._id}/edit`} className="btn btn-glass btn-sm">
                    Edit
                  </Link>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(p)}>
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
