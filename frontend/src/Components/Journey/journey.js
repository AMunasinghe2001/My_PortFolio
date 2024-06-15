import React from "react";
import Nav from "../Nav/nav";
import "./journey.css";
import { FaCircle } from "react-icons/fa";

const Timeline = () => {
  const timelineData = [
    {
      id: 1,
      title: "Bachelor of Information Technology",
      duration: "2022 - Present",
      institution: "Sri Lanka Institute of Information Technology",
      logo: "sliit.png", // Corrected path
    },
    {
      id: 2,
      title: "Information Communications Technology",
      duration: "2017 - 2021",
      institution: "H/Ruhunu Vijayaba National College",
      logo: "img/rvc.png", // Updated path
    },
    {
      id: 3,
      title: "Information Communications Technology",
      duration: "2017 - 2012",
      institution: "H/Tangalle National Boys School",
      logo: "./img/tnbs.png", // Updated path
    },
  ];

  return (
    <div>
      <Nav />
      <div className="timeline-container">
        <div className="timeline-title">
          <h1 className="timeline-title1">Journ</h1>
          <h1 className="timeline-title2">ey</h1>
        </div>

        <div className="timeline">
          {timelineData.map((item, index) => (
            <div
              key={item.id}
              className={`timeline-item ${index % 2 === 0 ? "left" : "right"}`}
            >
              <div className="timeline-content">
                <img
                  src={item.logo}
                  alt={`${item.title} logo`}
                  className="timeline-logo"
                />
                <h2>{item.title}</h2>
                <br />
                <h3>{item.duration}</h3>
                <p>{item.institution}</p>
              </div>
              <FaCircle className="timeline-icon" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
