import React from "react";
import "./about.css";
import aboutpic from "./img/aboutPic.png";

function About() {
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
              <p>
                I am a skilled and versatile professional in full-stack
                development and UI/UX design. With a passion for creating
                innovative digital solutions, I excel at transforming complex
                concepts into visually appealing and user-friendly experiences.
                My expertise includes HTML, CSS, JavaScript, PHP, ReactJS, and
                frameworks. I take pride in delivering high-quality code that
                exceeds expectations and am adept at problem-solving.
                <br />
                <br />
                Beyond my technical skills, I am a talented artist, architect, 
                photographer, etc. and a very active citizen in the arts.I share my 
                artistic knowledge and insights extensively with my full-stack development
                 and UI/UX design.My strong aim is to provide maximum satisfaction to my clients through web 
                 development and design along with my artistic knowledge and technical knowledge.
                <br />
                <br />
                I am enthusiastic about collaborating with like-minded individuals and 
                contributing my expertise to craft exceptional web experiences that 
                captivate and engage users.By attending conferences and workshops, 
                I stay up-to-date with the latest industry 
                trends and continuously enhance my skills.
                <br />
                <br />
              </p>
            </div>
          </div>
          <div className="abPic">
            <img src={aboutpic} alt="home pic" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
