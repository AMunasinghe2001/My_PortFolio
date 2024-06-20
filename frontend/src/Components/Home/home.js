import React, { useEffect, useState } from "react";
import Nav from "../Nav/nav";
import "./home.css";
import pic from "./img/pic.png";

const jobTitles = [
  "Frontend Developer",
  "Backend Developer",
  "UI/UX Designer",
  "Mobile App Developer",
  "Software Developer"
];

function Home() {
  const [currentTitle, setCurrentTitle] = useState("");
  const [titleIndex, setTitleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const typeTimeout = setTimeout(() => {
      if (!isDeleting) {
        setCurrentTitle((prev) => prev + jobTitles[titleIndex].charAt(charIndex));
        setCharIndex((prev) => prev + 1);

        if (charIndex === jobTitles[titleIndex].length) {
          setIsPaused(true);
          setTimeout(() => {
            setIsPaused(false);
            setIsDeleting(true);
          }, 2000); // Pause before deleting
        }
      } else {
        setCurrentTitle((prev) => prev.slice(0, -1));
        setCharIndex((prev) => prev - 1);

        if (charIndex === 0) {
          setIsDeleting(false);
          setTitleIndex((prev) => (prev + 1) % jobTitles.length);
        }
      }
    }, isDeleting ? 100 : 150);

    return () => clearTimeout(typeTimeout);
  }, [charIndex, isDeleting, isPaused, titleIndex]);

  return (
    <div id="home">
      <Nav />
      <div className="cover">
        <div className="header">
          <h2 className="animated-text">Hello, It's Me...</h2>
          <br />

          <div className="name animated-text">
            <h1>Anushanga Munasinghe</h1>
            <br />
          </div>
          <h2 className="animated-text">And I'm</h2>
          <br />
          <div className="job animated-text">
            <h1>
              &shy;{currentTitle}
              <span className="cursor">|</span>
            </h1>
            <br />
          </div>
          <div className="homeAbout animated-text">
            <p>
              Welcome to my portfolio! I'm a full-stack developer and UI/UX
              designer passionate about crafting exceptional digital
              experiences. Browse through my work and discover my expertise in
              front-end development and design. Let's create something
              extraordinary together!
            </p>
          </div>

          <button className="btnCV animated-text">
            Download Resume <i className="fas fa-download"></i>
          </button>
        </div>
        <div className="pic">
          <img src={pic} alt="home pic" />
        </div>
      </div>
    </div>
  );
}

export default Home;
