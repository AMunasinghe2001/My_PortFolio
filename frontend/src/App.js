import React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";

import PublicSite from "./Components/PublicSite";
import Login from "./Components/Login/login.js";
import ProtectedRoute from "./Components/ProtectedRoute";

import AdminHome from "./Components/Admin/AdminHome";
import ProfileEditor from "./Components/Admin/ProfileEditor";
import SkillsEditor from "./Components/Admin/SkillsEditor";
import JourneyEditor from "./Components/Admin/JourneyEditor";
import ServicesEditor from "./Components/Admin/ServicesEditor";
import ProjectsManager from "./Components/Dashboard/dashboard";
import AddProject from "./Components/AddProject/addproject";
import UpdateProject from "./Components/UpdateProject/updateproject";

const protect = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

function App() {
  return (
    <div className="fullApp">
      <Routes>
        {/* Public portfolio */}
        <Route path="/" element={<PublicSite />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Admin (token-protected) */}
        <Route path="/admin" element={protect(<AdminHome />)} />
        <Route path="/admin/profile" element={protect(<ProfileEditor />)} />
        <Route path="/admin/projects" element={protect(<ProjectsManager />)} />
        <Route path="/admin/projects/new" element={protect(<AddProject />)} />
        <Route path="/admin/projects/:id/edit" element={protect(<UpdateProject />)} />
        <Route path="/admin/skills" element={protect(<SkillsEditor />)} />
        <Route path="/admin/journey" element={protect(<JourneyEditor />)} />
        <Route path="/admin/services" element={protect(<ServicesEditor />)} />

        {/* Fallback */}
        <Route path="*" element={<PublicSite />} />
      </Routes>
    </div>
  );
}

export default App;
