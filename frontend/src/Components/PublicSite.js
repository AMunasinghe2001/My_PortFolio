import React from "react";
import Home from "./Home/home";
import About from "./About/about";
import Journey from "./Journey/journey";
import Skills from "./Skills/skills";
import Project from "./Project/project";
import Services from "./Services/services";
import Countact from "./Countact/countact";

// The public single-page portfolio. All sections read their content from the
// backend API (with a hardcoded fallback inside each component).
function PublicSite() {
  return (
    <div className="pages">
      <Home />
      <About />
      <Journey />
      <Skills />
      <Project />
      <Services />
      <Countact />
    </div>
  );
}

export default PublicSite;
