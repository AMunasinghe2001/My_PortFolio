import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import "./journey.css";
import rvc from "./img/rvc.png";
import tnbs from "./img/tnbs.png";
import sliit from "./img/sliit.png";
import uom from "./img/uom.png";

const fallbackJourney = [
  { title: "Web Desing for Beginners", duration: "2024", institution: "University of Moratuwa", logo: uom },
  { title: "Phython for Beginners", duration: "2024", institution: "University of Moratuwa", logo: uom },
  { title: "Bachelor of Information Technology", duration: "2022 - Present", institution: "Sri Lanka Institute of Information Technology", logo: sliit },
  { title: "Information Communications Technology", duration: "2017 - 2021", institution: "H/Ruhunu Vijayaba National College", logo: rvc },
  { title: "Information Communications Technology", duration: "2012 - 2017", institution: "H/Tangalle National Boys School", logo: tnbs },
];

const Timeline = () => {
  const [timelineData, setTimelineData] = useState(fallbackJourney);

  useEffect(() => {
    api
      .get("/journey")
      .then((res) => {
        const journey = res.data && res.data.journey;
        if (Array.isArray(journey) && journey.length) setTimelineData(journey);
      })
      .catch((error) => console.error("Journey fetch failed", error));
  }, []);

  return (
    <div id="journey">
      <div className="timeline-container">
        <div className="timeline-title animated-text">
          <h1 className="timeline-title1">Journ</h1>
          <h1 className="timeline-title2">ey</h1>
        </div>

        <div className="timeline">
          {timelineData.map((item, index) => (
            <div
              key={item._id || index}
              className={`timeline-item ${index % 2 === 0 ? "left" : "right"}`}
              style={{ animationDelay: `${index * 1}s` }}
            >
              <div className="timeline-img"></div>

              <div className="timeline-content">
                {item.logo && (
                  <img
                    src={item.logo}
                    alt={`${item.title} logo`}
                    className="timeline-logo"
                  />
                )}
                <h2>{item.title}</h2>
                <br />
                <h3>{item.duration}</h3>
                <p>{item.institution}</p>
                <span className="arrow"></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
