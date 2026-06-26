import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./admin.css";

const links = [
  { to: "/admin", label: "Home" },
  { to: "/admin/profile", label: "Profile" },
  { to: "/admin/projects", label: "Projects" },
  { to: "/admin/skills", label: "Skills" },
  { to: "/admin/journey", label: "Journey" },
  { to: "/admin/services", label: "Services" },
];

const AdminNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, logout } = useAuth();

  const isActive = (to) =>
    to === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(to);

  return (
    <div className="admin-nav">
      <div className="admin-nav-links">
        {links.map((l) => (
          <button
            key={l.to}
            className={`admin-nav-link ${isActive(l.to) ? "active" : ""}`}
            onClick={() => navigate(l.to)}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className="admin-nav-right">
        <span className="admin-user">👤 {username || "admin"}</span>
        <button className="admin-view-site" onClick={() => navigate("/")}>
          View Site ↗
        </button>
        <button
          className="admin-logout"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminNav;
