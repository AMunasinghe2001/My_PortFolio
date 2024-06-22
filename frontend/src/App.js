import React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";

import Home from "./Components/Home/home";

import About from "./Components/About/about";
import Journey from "./Components/Journey/journey";
import Skills from "./Components/Skills/skills";
import Project from "./Components/Project/project";
import Services from "./Components/Services/services";
import Countact from "./Components/Countact/countact";
import Login from "./Components/Login/login.js";
import AddProject from "./Components/AddProject/addproject";
import Dashboard from "./Components/Dashboard/dashboard";
import UpdateProject from './Components/UpdateProject/updateproject';

function App() {
  return (
    <div className="fullApp">
      <div className="pages">
        <Home />
        <About />
        <Journey />
        <Skills />
        <Project />
        <Services />
        <Countact />
      </div>

      <div className="App">
        <React.Fragment>
          <Routes>
            {/* <Route path="/mainhome" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/services" element={<Services />} />
          <Route path="/countact" element={<Countact />} />
          <Route path="/footer" element={<Footer />} />
          <Route path="/project" element={<Project />} /> */}
            
            <Route path="/addproject" element={<AddProject />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/updateproject/:id" element={<UpdateProject />} />

            <Route path="/login" element={<Login/>} />
            
          </Routes>
        </React.Fragment>
      </div>
    </div>
  );
}

export default App;
