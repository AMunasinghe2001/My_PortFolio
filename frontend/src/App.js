import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';

import Home from "./Components/Home/home";
import Nav from "./Components/Nav/nav";
import About from "./Components/About/about";
import Journey from "./Components/Journey/journey";
import Skills from "./Components/Skills/skill";
import Project from "./Components/Project/project";
import Services from "./Components/Services/services";
import Countact from "./Components/Countact/countact";
import Footer from "./Components/Footer/footer";

function App() {
  return (
    <div>
      <Home/>
      <About/>
      <Journey/>
      <Skills/>
      <Project/>
      <Services/>
      <Countact/>

      <React.Fragment>
        <Routes>
          
          <Route path="/mainhome"element={<Home/>}/>
          <Route path="/about"element={<About/>}/>
          <Route path="/journey"element={<Journey/>}/>
          <Route path="/skills"element={<Skills/>}/>
          <Route path="/project"element={<Project/>}/>
          <Route path="/services"element={<Services/>}/>
          <Route path="/countact"element={<Countact/>}/>
          <Route path="/footer"element={<Footer/>}/>
        </Routes>
      </React.Fragment>
    </div>
  );
}

export default App;
