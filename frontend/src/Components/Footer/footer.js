import React, { useEffect, useState } from "react";
import { getCachedProfile, fetchProfile } from "../../api/profile";
import "./footer.css";
import facebook from "./img/facebook.png";
import watsapp from "./img/watsapp.png";
import github from "./img/github.png";
import linkin from "./img/linkin.png";

const fallback = {
  name: "Anushanga Munasinghe",
  footerTagline:
    "A focused Web Developer building the Websites and Web Applications that lead to the success of the overall product",
  copyrightName: "Anushanga Munasinghe",
  social: {
    facebook: "https://web.facebook.com/anushanga.kawshan.1",
    whatsapp: "https://wa.me/qr/PNKZI5JKCMJKK1",
    github: "https://github.com/AMunasinghe2001",
    linkedin: "https://www.linkedin.com/in/anushanga-munasinghe-9b51882a2/",
  },
};

const toData = (p) => ({
  name: p.name || fallback.name,
  footerTagline: p.footerTagline || fallback.footerTagline,
  copyrightName: p.copyrightName || fallback.copyrightName,
  social: { ...fallback.social, ...(p.social || {}) },
});

function Footer() {
  const [data, setData] = useState(() => {
    const p = getCachedProfile();
    return p ? toData(p) : fallback;
  });

  useEffect(() => {
    fetchProfile()
      .then((p) => {
        if (p) setData(toData(p));
      })
      .catch((error) => console.error("Footer fetch failed", error));
  }, []);

  const s = data.social;

  return (
    <div>
      <footer>
        <div className="footerHead">
          <h2>{data.name}</h2>
        </div>

        <div className="footerHead">
          <p>{data.footerTagline}</p>
        </div>

        <div className="footerContainer">
          <div className="socialIcons">
            {s.facebook && (
              <a href={s.facebook} data-popup="Facebook" target="_blank" rel="noopener noreferrer">
                <img src={facebook} alt="facebook" />
              </a>
            )}
            {s.whatsapp && (
              <a href={s.whatsapp} data-popup="WhatsApp" target="_blank" rel="noopener noreferrer">
                <img src={watsapp} alt="watsapp" />
              </a>
            )}
            {s.github && (
              <a href={s.github} data-popup="GitHub" target="_blank" rel="noopener noreferrer">
                <img src={github} alt="github" />
              </a>
            )}
            {s.linkedin && (
              <a href={s.linkedin} data-popup="LinkedIn" target="_blank" rel="noopener noreferrer">
                <img src={linkin} alt="linkin" />
              </a>
            )}
          </div>
        </div>
        <div className="footerBottom">
          <p>
            Copyright &copy;2023; Designed by{" "}
            <span className="designer">{data.copyrightName}</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
