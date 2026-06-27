import React, { useEffect, useState } from "react";
import Skill from "./skill.js";
import api from "../../api/axios";
import "./skills.css";

const fallbackTechnical = [
  { title: "FIGMA", percentage: 97 },
  { title: "HTML 5", percentage: 96 },
  { title: "CSS", percentage: 96 },
  { title: "JavaScript", percentage: 72 },
  { title: "React JS", percentage: 89 },
  { title: "PHP", percentage: 83 },
  { title: "MySQL", percentage: 71 },
];

const fallbackProfessional = [
  { title: "Communication", percentage: 90 },
  { title: "Team Work", percentage: 95 },
  { title: "Project Management", percentage: 87 },
  { title: "Creativity", percentage: 95 },
];

const fallbackDatabase = [
  { title: "MongoDB", percentage: 90 },
  { title: "MySQL", percentage: 85 },
  { title: "Supabase", percentage: 82 },
  { title: "Firebase", percentage: 78 },
];

const fallbackTools = [
  { title: "Git / GitHub", percentage: 92 },
  { title: "VS Code", percentage: 95 },
  { title: "Figma", percentage: 90 },
  { title: "Postman", percentage: 85 },
  { title: "XAMPP", percentage: 80 },
];

const Skills = () => {
  const [technicalSkills, setTechnicalSkills] = useState(fallbackTechnical);
  const [databaseSkills, setDatabaseSkills] = useState(fallbackDatabase);
  const [toolsSkills, setToolsSkills] = useState(fallbackTools);
  const [professionalSkills, setProfessionalSkills] = useState(fallbackProfessional);

  useEffect(() => {
    // Technical Skills + Database Management are generated automatically from
    // GitHub (falling back to the hardcoded defaults above). Tools +
    // Professional skills come from the admin-managed DB.
    api
      .get("/github-skills")
      .then((res) => {
        const data = res.data || {};
        if (Array.isArray(data.skills) && data.skills.length) {
          setTechnicalSkills(data.skills);
        }
        if (Array.isArray(data.databases) && data.databases.length) {
          setDatabaseSkills(data.databases);
        }
      })
      .catch((error) => console.error("GitHub skills fetch failed", error));

    api
      .get("/skills")
      .then((res) => {
        const skills = res.data && res.data.skills;
        if (Array.isArray(skills) && skills.length) {
          const tools = skills.filter((s) => s.category === "tool");
          if (tools.length) setToolsSkills(tools);
          const prof = skills.filter((s) => s.category === "professional");
          if (prof.length) setProfessionalSkills(prof);
        }
      })
      .catch((error) => console.error("Skills fetch failed", error));
  }, []);

  return (
    <div id="skills">
      <div className="skillsTitle animated-text">
        <h1 className="skills-title1">Skil</h1>
        <h1 className="skills-title2 ">ls</h1>
      </div>
      <div className="skills">
        <div className="technical-skills ">
          <h2 className="skill animated-text">Technical Skills</h2>
          {technicalSkills.map((skill, index) => (
            <Skill
              key={skill._id || index}
              title={skill.title}
              percentage={skill.percentage}
            />
          ))}
        </div>
        <div className="database-skills">
          <h2 className="skill animated-text">Database Management</h2>
          {databaseSkills.map((skill, index) => (
            <Skill
              key={skill._id || index}
              title={skill.title}
              percentage={skill.percentage}
            />
          ))}
        </div>
        <div className="tools-skills">
          <h2 className="skill animated-text">Tools</h2>
          {toolsSkills.map((skill, index) => (
            <Skill
              key={skill._id || index}
              title={skill.title}
              percentage={skill.percentage}
            />
          ))}
        </div>
        <div className="professional-skills">
          <h2 className="skill animated-text">Professional Skills</h2>
          {professionalSkills.map((skill, index) => (
            <Skill
              key={skill._id || index}
              title={skill.title}
              percentage={skill.percentage}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skills;
