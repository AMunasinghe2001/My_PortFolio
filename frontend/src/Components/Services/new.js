import React from "react";
import Nav from "../Nav/nav";
import "./services.css";
import { FaCircle } from "react-icons/fa";

function Services() {
  const timelineData = [
    {
      id: 1,
      logo: "",
      tital: "Frontend Development",
      conten:
        "With proficiency in HTML, CSS, JavaScript, and React, I create visually appealing and user-friendly frontend experiences that adapt smoothly across devices.",
    },
  ];
  return (
    <div>
      <Nav />
      <div>
        <div className="flexContainer">
          <div className="timeline">
            {timelineData.map((item, index) => (
              <div
                key={item.id}
                className={`timeline-item ${
                  index % 2 === 0 ? "left" : "right"
                }`}
              >

<div
            className={`sBoxPic ${isHovered ? "hovered" : ""}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="sBIcon">
            <img
                  src={item.logo}
                  alt={`${item.title} logo`}
                  className="timeline-logo"
                />
            <h2>{item.title}</h2>
            <div className="sBP">
            <p>{item.conten}</p>
            </div>
          </div>

                <FaCircle className="timeline-icon" />
              </div>
            ))}
          </div>
        </div></div>
      </div>
    </div>
  );
}

export default Services;
