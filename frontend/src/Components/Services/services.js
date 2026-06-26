import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import "./services.css";
import {
  FaLaptopCode,
  FaDatabase,
  FaPenNib,
  FaAndroid,
  FaCogs,
  FaMobileAlt,
  FaPaintBrush,
  FaServer,
  FaCode,
  FaReact,
} from "react-icons/fa";

// Maps the stored icon key string -> a react-icons component.
// (Keep in sync with ICON_KEYS in Admin/ServicesEditor.js)
export const iconMap = {
  FaLaptopCode,
  FaDatabase,
  FaPenNib,
  FaAndroid,
  FaCogs,
  FaMobileAlt,
  FaPaintBrush,
  FaServer,
  FaCode,
  FaReact,
};

export const renderServiceIcon = (key) => {
  const Icon = iconMap[key] || FaCogs;
  return <Icon />;
};

const fallbackServices = [
  { title: "Frontend Develop", icon: "FaLaptopCode", description: "With proficiency in HTML, CSS, JavaScript, and React, I create visually appealing and user-friendly frontend experiences that adapt smoothly across devices. My focus is on building responsive and interactive interfaces that enhance user engagement.." },
  { title: "Backend Develop", icon: "FaDatabase", description: "Skilled in MongoDB and MySQL, I specialize in backend development. I handle data storage, retrieval, and manipulation, building efficient backend systems for web applications." },
  { title: "UI/UX Design", icon: "FaPenNib", description: "With a deep understanding of user-centered design principles, I specialize in creating exceptional UI/UX experiences. I collaborate closely with developers and conduct user research to ensure designs meet user needs." },
  { title: "Mobile App development", icon: "FaAndroid", description: "With a deep understanding of user-centered design principles, I specialize in crafting outstanding UI/UX experiences. I closely collaborate with developers and conduct user research to create mobile applications that are not only functional but also intuitive and engaging." },
  { title: "Software development", icon: "FaCogs", description: "With specialized skills in MongoDB and MySQL, I excel in backend development, efficiently handling data storage, retrieval, and manipulation. I create robust and scalable backend systems for web applications, ensuring seamless performance and reliability." },
];

const Services = () => {
  const [servicesData, setServicesData] = useState(fallbackServices);

  useEffect(() => {
    api
      .get("/services")
      .then((res) => {
        const services = res.data && res.data.services;
        if (Array.isArray(services) && services.length) setServicesData(services);
      })
      .catch((error) => console.error("Services fetch failed", error));
  }, []);

  return (
    <div id="services">
      <div className="services-container ">
        <div className="services-title animated-text">
          <h1 className="services-title1">Our</h1>
          <h1 className="services-title2">Services</h1>
        </div>

        <div className="services-grid">
          {servicesData.map((service, index) => (
            <div key={service._id || index} className="service-card ">
              <div className="service-icon animated-text">
                {renderServiceIcon(service.icon)}
              </div>
              <h2 className="service-title animated-text">{service.title}</h2>
              <p className="service-description animated-text">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
