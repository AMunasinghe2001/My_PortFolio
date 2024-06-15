import React from 'react';
import Nav from "../Nav/nav";
import './services.css';
import { FaLaptopCode, FaDatabase, FaPenNib } from 'react-icons/fa';

const Services = () => {
  const servicesData = [
    {
      id: 1,
      title: "Frontend Develope",
      description: "With proficiency in HTML, CSS, JavaScript, and React, I create visually appealing and user-friendly frontend experiences that adapt smoothly across devices.",
      icon: <FaLaptopCode />,
    },
    {
      id: 2,
      title: "Backend Develope",
      description: "Skilled in MongoDB and MySQL, I specialize in backend development. I handle data storage, retrieval, and manipulation, building efficient backend systems for web applications.",
      icon: <FaDatabase />,
    },
    {
      id: 3,
      title: "UI/UX Design",
      description: "With a deep understanding of user-centered design principles, I specialize in creating exceptional UI/UX experiences. I collaborate closely with developers and conduct user research to ensure designs meet user needs.",
      icon: <FaPenNib />,
    },
  ];

  return (
    <div>
      <Nav/>
      <div className="services-container">
        <div className="services-title">
        <h1 className="services-title1">Our</h1>
        <h1 className="services-title2">Services</h1>
        </div>
      
      <div className="services-grid">
        {servicesData.map(service => (
          <div key={service.id} className="service-card">
            <div className="service-icon">{service.icon}</div>
            <h2 className="service-title">{service.title}</h2>
            <p className="service-description">{service.description}</p>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default Services;
