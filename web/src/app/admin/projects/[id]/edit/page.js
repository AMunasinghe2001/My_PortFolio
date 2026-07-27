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
    api
      .get(`/projects/${id}`)
      .then((res) => setProject(res.data?.project || {}))
      .catch(() => setError({ type: "error", text: "Failed to load project." }));
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
