import React, { useState } from "react";
import './nav.css';
import { Link } from "react-router-dom";

function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <div className="mainDiv">
        <div className="hamburger" onClick={toggleMenu}>
          &#9776;
        </div>
        <ul className={`home-u1 ${isOpen ? 'show' : ''}`}>
          <li className="home-11">
            <a href="#home" className="active home-a">
              <h1>Home</h1>
            </a>
          </li>
          <li className="home-11">
            <a href="#about" className="active home-a">
              <h1>About</h1>
            </a>
          </li>
          <li className="home-11">
            <Link to="/journey" className="active home-a">
              <h1>Journey</h1>
            </Link>
          </li>
          <li className="home-11">
            <Link to="/skills" className="active home-a">
              <h1>Skills</h1>
            </Link>
          </li>
          <li className="home-11">
            <Link to="/project" className="active home-a">
              <h1>Project</h1>
            </Link>
          </li>
          <li className="home-11">
            <a href="#services" className="active home-a">
              <h1>Services</h1>
            </a>
          </li>
          <li className="home-11">
            <Link to="/contact" className="active home-a">
              <h1>Hire Me</h1>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Nav;
