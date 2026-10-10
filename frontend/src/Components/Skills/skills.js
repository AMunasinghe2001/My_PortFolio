import React, { useEffect, useState } from "react";
import Skill from "./skill.js";
import api from "../../api/axios";
import "./skills.css";

const fallbackTechnical = [
  { title: "Dart", percentage: 100 },
  { title: "TypeScript", percentage: 33 },
  { title: "JavaScript", percentage: 25 },
  { title: "Python", percentage: 20 },
  { title: "Java", percentage: 29 },
  { title: "PHP", percentage: 21 },
  { title: "CSS", percentage: 16 },
  { title: "C++", percentage: 13 },
];

const fallbackProfessional = [
  { title: "Communication", percentage: 90 },
  { title: "Team Work", percentage: 95 },
  { title: "Project Management", percentage: 87 },
  { title: "Creativity", percentage: 95 },
];

const fallbackDatabase = [
  { title: "PostgreSQL", percentage: 100 },
  { title: "MongoDB", percentage: 100 },
  { title: "Firebase", percentage: 50 },
  { title: "Supabase", percentage: 50 },
];

const fallbackTools = [
  { title: "Git / GitHub", percentage: 92 },
  { title: "VS Code", percentage: 95 },
  { title: "Figma", percentage: 90 },
  { title: "Postman", percentage: 85 },
  { title: "XAMPP", percentage: 80 },
];

const SkillsSkeleton = ({ count = 4 }) => (
  <div>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="skills-skeleton-item">
        <div className="skills-skeleton-head">
          <div className="skills-skeleton-title" style={{ width: `${35 + (i % 3) * 15}%` }} />
          <div className="skills-skeleton-pct" />
        </div>
        <div className="skills-skeleton-track" />
      </div>
    ))}
  </div>
);

const Skills = () => {
  const [loading, setLoading] = useState(true);
  const [technicalSkills, setTechnicalSkills] = useState([]);
  const [databaseSkills, setDatabaseSkills] = useState([]);
  const [toolsSkills, setToolsSkills] = useState([]);
  const [professionalSkills, setProfessionalSkills] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [ghRes, skillsRes] = await Promise.allSettled([
          api.get("/github-skills"),
          api.get("/skills"),
        ]);

        if (!isMounted) return;

        // GitHub Skills
        if (ghRes.status === "fulfilled" && ghRes.value?.data) {
          const data = ghRes.value.data;
          if (Array.isArray(data.skills) && data.skills.length) {
            const hasDart = data.skills.some((s) => s.title.toLowerCase() === "dart");
            if (data.authenticated || hasDart) {
              setTechnicalSkills(data.skills);
            } else {
              setTechnicalSkills([
                ...data.skills,
                ...fallbackTechnical.filter(
                  (f) => !data.skills.some((s) => s.title.toLowerCase() === f.title.toLowerCase())
                ),
              ]);
            }
          } else {
            setTechnicalSkills(fallbackTechnical);
          }

          if (Array.isArray(data.databases) && data.databases.length) {
            const hasPg = data.databases.some((d) => d.title.toLowerCase() === "postgresql");
            if (data.authenticated || hasPg) {
              setDatabaseSkills(data.databases);
            } else {
              setDatabaseSkills([
                ...data.databases,
                ...fallbackDatabase.filter(
                  (f) => !data.databases.some((d) => d.title.toLowerCase() === f.title.toLowerCase())
                ),
              ]);
            }
          } else {
            setDatabaseSkills(fallbackDatabase);
          }
        } else {
          setTechnicalSkills(fallbackTechnical);
          setDatabaseSkills(fallbackDatabase);
        }

        // Admin-managed Skills
        if (skillsRes.status === "fulfilled" && skillsRes.value?.data?.skills) {
          const skills = skillsRes.value.data.skills;
          const tools = skills.filter((s) => s.category === "tool");
          const prof = skills.filter((s) => s.category === "professional");
          setToolsSkills(tools.length ? tools : fallbackTools);
          setProfessionalSkills(prof.length ? prof : fallbackProfessional);
        } else {
          setToolsSkills(fallbackTools);
          setProfessionalSkills(fallbackProfessional);
        }
      } catch (err) {
        if (!isMounted) return;
        setTechnicalSkills(fallbackTechnical);
        setDatabaseSkills(fallbackDatabase);
        setToolsSkills(fallbackTools);
        setProfessionalSkills(fallbackProfessional);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
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
          {loading ? (
            <SkillsSkeleton count={4} />
          ) : (
            technicalSkills.map((skill, index) => (
              <Skill
                key={skill._id || index}
                title={skill.title}
                percentage={skill.percentage}
              />
            ))
          )}
        </div>
        <div className="database-skills">
          <h2 className="skill animated-text">Database Management</h2>
          {loading ? (
            <SkillsSkeleton count={3} />
          ) : (
            databaseSkills.map((skill, index) => (
              <Skill
                key={skill._id || index}
                title={skill.title}
                percentage={skill.percentage}
              />
            ))
          )}
        </div>
        <div className="tools-skills">
          <h2 className="skill animated-text">Tools</h2>
          {loading ? (
            <SkillsSkeleton count={4} />
          ) : (
            toolsSkills.map((skill, index) => (
              <Skill
                key={skill._id || index}
                title={skill.title}
                percentage={skill.percentage}
              />
            ))
          )}
        </div>
        <div className="professional-skills">
          <h2 className="skill animated-text">Professional Skills</h2>
          {loading ? (
            <SkillsSkeleton count={4} />
          ) : (
            professionalSkills.map((skill, index) => (
              <Skill
                key={skill._id || index}
                title={skill.title}
                percentage={skill.percentage}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Skills;
