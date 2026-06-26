import React from "react";
import { useNavigate } from "react-router-dom";
import AdminNav from "./AdminNav";
import "./admin.css";

const sections = [
  { to: "/admin/profile", title: "Profile & Hero", desc: "Name, titles, intro, about, social links, resume & images", icon: "🧑" },
  { to: "/admin/projects", title: "Projects", desc: "Add, edit or delete portfolio projects", icon: "💼" },
  { to: "/admin/skills", title: "Skills", desc: "Technical & professional skill bars", icon: "📊" },
  { to: "/admin/journey", title: "Journey", desc: "Education & timeline entries", icon: "🎓" },
  { to: "/admin/services", title: "Services", desc: "Service cards shown on the site", icon: "🛠️" },
];

const AdminHome = () => {
  const navigate = useNavigate();
  return (
    <div className="admin-page">
      <AdminNav />
      <div className="admin-container">
        <h1 className="admin-title">Dashboard</h1>
        <p className="admin-subtitle">Manage every section of your portfolio. Changes go live immediately.</p>
        <div className="admin-cards">
          {sections.map((s) => (
            <div key={s.to} className="admin-card" onClick={() => navigate(s.to)}>
              <div className="admin-card-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
