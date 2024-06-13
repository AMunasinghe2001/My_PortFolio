import React from "react";
import './nav.css';
import {Link} from "react-router-dom";

function nav() {
  return (
    <div>
      <ul className="home-u1">
        <li className="home-11">
          <Link to="/mainhome" className="active home-a">
          <h1>Home</h1>
          </Link>
        </li>
        <li className="home-11">
        <Link to="/about" className="active home-a">
          <h1>About</h1>
          </Link>
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
        <Link to="/services" className="active home-a">
          <h1>Services</h1>
          </Link>
        </li>
        <li className="home-11">
        <Link to="/countact" className="active home-a">
          <h1>Hire Me</h1>
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default nav;
