import React from "react";
import Nav from "../Nav/nav";
import "./home.css";
import pic from "./img/pic.png";

function home() {
  return (
    <div>
      <Nav />
      <div className="cover">
        <div className="header">
          <h2>Hello, It's Me...</h2>
          <br />

          <div className="name">
            <h1>Anushanga Munasinghe</h1>
            <br />
          </div>
          <h2>And I'm</h2>
          <br />
          <div className="job">
            <h1>Backend Developer</h1>
            <br />
          </div>
          <div className="homeAbout">
            <p>
              Welcome to my portfolio! I'm a full-stack developer and UI/UX
              designer passionate about crafting exceptional digital
              experiences. Browse through my work and discover my expertise in
              front-end development and design. Let's create something
              extraordinary together!"
            </p>
          </div>

          <button className="btnCV">Downlord Resume</button>
        </div>
        <div className="pic">
          <img src={pic} alt="home pic" />
        </div>
      </div>
    </div>
  );
}

export default home;
