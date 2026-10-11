"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import ProjectForm from "@/components/admin/ProjectForm";
import { Message, Empty } from "@/components/admin/ui";

export default function EditProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProject = async () => {
      // 1. Try backend API first (for existing MongoDB projects)
      try {
        const res = await api.get(`/projects/${id}`);
        if (res.data?.project && isMounted) {
          setProject(res.data.project);
          return;
        }
      } catch {
        /* try fallback */
      }

      // 2. Try fetching from Next.js internal /api/github-projects (for GitHub dynamic projects)
      try {
        const ghRes = await fetch(`/api/github-projects?t=${Date.now()}`);
        if (ghRes.ok) {
          const data = await ghRes.json();
          const list = Array.isArray(data.projects) ? data.projects : [];
          const found = list.find(
            (p) =>
              String(p._id) === String(id) ||
              String(p.id) === String(id) ||
              (p.rawName && p.rawName.toLowerCase() === String(id).toLowerCase())
          );
          if (found && isMounted) {
            setProject(found);
            return;
          }
        }
      } catch {
        /* ignore */
      }

      // 3. Try fetching from general /projects list
      try {
        const allRes = await api.get(`/projects?t=${Date.now()}`);
        if (Array.isArray(allRes.data?.projects)) {
          const found = allRes.data.projects.find(
            (p) =>
              String(p._id) === String(id) ||
              String(p.id) === String(id) ||
              (p.rawName && p.rawName.toLowerCase() === String(id).toLowerCase())
          );
          if (found && isMounted) {
            setProject(found);
            return;
          }
        }
      } catch {
        /* ignore */
      }

      if (isMounted) {
        setError({ type: "error", text: "Failed to load project." });
      }
    };

    fetchProject();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (error) return <Message msg={error} />;
  if (!project) return <Empty>Loading project…</Empty>;

  return (
    <ProjectForm
      mode="edit"
      projectId={id}
      currentImage={project.image || ""}
      initialValues={{
        title: project.title || "",
        technology: project.technology || "",
        url: project.url || "",
        liveUrl: project.liveUrl || "",
        description: project.description || "",
      }}
    />
  );
}
