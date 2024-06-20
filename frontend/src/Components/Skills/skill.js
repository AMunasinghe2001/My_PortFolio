import React from 'react';
import './skill.css';

const Skill = ({ title, percentage }) => {
  return (
    <div className="skill-container animated-text">
      <div className="skill-title ">{title}</div>
      <div className="skill-bar">
        <div className="skill-percentage" style={{ width: `${percentage}%` }}></div>
      </div>
      <div className="skill-percentage-label">{percentage}%</div>
    </div>
  );
};

export default Skill;
