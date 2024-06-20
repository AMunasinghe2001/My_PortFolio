import React from "react";
import Skill from "./skill.js";
import "./skills.css";

const Skills = () => {
  const technicalSkills = [
    { title: "FIGMA", percentage: 97 },
    { title: "HTML 5", percentage: 96 },
    { title: "CSS", percentage: 96 },
    { title: "JavaScript", percentage: 72 },
    { title: "React JS", percentage: 89 },
    { title: "PHP", percentage: 83 },
    { title: "MySQL", percentage: 71 },
  ];

  const professionalSkills = [
    { title: "Communication", percentage: 90 },
    { title: "Team Work", percentage: 95 },
    { title: "Project Management", percentage: 87 },
    { title: "Creativity", percentage: 95 },
  ];

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
              key={index}
              title={skill.title}
              percentage={skill.percentage}
            />
          ))}
        </div>
        <div className="professional-skills">
          <h2 className="skill animated-text">Professional Skills</h2>
          {professionalSkills.map((skill, index) => (
            <Skill
              key={index}
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
