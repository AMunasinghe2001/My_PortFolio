import React from "react";
import "./footer.css";
import facebook from "./img/facebook.png";
import watsapp from "./img/watsapp.png";
import github from "./img/github.png";
import linkin from "./img/linkin.png";

function Footer() {
  return (
    <div>
      <footer>
        <div className="footerHead">
          <h2>Anushanga Munasinghe</h2>
        </div>

        <div className="footerHead">
          <p>
            A focused Web Developer building the Websites and Web Applications
            that lead to the success of the overall product
          </p>
        </div>

        <div className="footerContainer">
          <div className="socialIcons">
            <a href="#" data-popup="Facebook">
              <img src={facebook} alt="facebook" />
            </a>
            <a href="#" data-popup="WhatsApp">
              <img src={watsapp} alt="watsapp" />
            </a>
            <a href="#" data-popup="GitHub">
              <img src={github} alt="github" />
            </a>
            <a href="#" data-popup="LinkedIn">
              <img src={linkin} alt="linkin" />
            </a>
          </div>
        </div>
        <div className="footerBottom">
          <p>
            Copyright &copy;2023; Designed by{" "}
            <span className="designer">Anushanga Munasinghe</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
