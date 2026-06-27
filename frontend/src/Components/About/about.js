import React, { useEffect, useState } from "react";
import { getCachedProfile, fetchProfile } from "../../api/profile";
import "./about.css";
import aboutPicFallback from "./img/aboutPic.png";

const fallbackParagraphs = [
  "I am a skilled and versatile professional in full-stack development and UI/UX design. With a passion for creating innovative digital solutions, I excel at transforming complex concepts into visually appealing and user-friendly experiences. My expertise includes HTML, CSS, JavaScript, PHP, ReactJS, and frameworks. I take pride in delivering high-quality code that exceeds expectations and am adept at problem-solving.",
  "Beyond my technical skills, I am a talented artist, architect, photographer, etc. and a very active citizen in the arts. I share my artistic knowledge and insights extensively with my full-stack development and UI/UX design. My strong aim is to provide maximum satisfaction to my clients through web development and design along with my artistic knowledge and technical knowledge.",
  "I am enthusiastic about collaborating with like-minded individuals and contributing my expertise to craft exceptional web experiences that captivate and engage users. By attending conferences and workshops, I stay up-to-date with the latest industry trends and continuously enhance my skills.",
];

function About() {
  // Seed from the cached profile so the correct About image/text render
  // immediately on reload (no flash of the old bundled image).
  const [paragraphs, setParagraphs] = useState(() => {
    const c = getCachedProfile();
    return c && Array.isArray(c.aboutParagraphs) && c.aboutParagraphs.length
      ? c.aboutParagraphs
      : fallbackParagraphs;
  });
  const [aboutImage, setAboutImage] = useState(() => (getCachedProfile() || {}).aboutImage || "");

  useEffect(() => {
    fetchProfile()
      .then((p) => {
        if (p) {
          if (Array.isArray(p.aboutParagraphs) && p.aboutParagraphs.length) {
            setParagraphs(p.aboutParagraphs);
          }
          if (p.aboutImage) setAboutImage(p.aboutImage);
        }
      })
      .catch((error) => console.error("About fetch failed", error));
  }, []);

  return (
    <div id="about">
      <div className="aboutbg">
        <div className="fullConten">
          <div className="about">
            <div className="hAbout animated-text">
              <h1>About</h1>
              <div className="me">
                <h1>Me</h1>
              </div>
            </div>
            <div className="cunten animated-text">
              {paragraphs.map((para, i) => (
                <p key={i}>
                  {para}
                  <br />
                  <br />
                </p>
              ))}
            </div>
          </div>
          <div className="abPic">
            <img src={aboutImage || aboutPicFallback} alt="about pic" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
