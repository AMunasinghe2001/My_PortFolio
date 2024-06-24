import React from "react";
import "./services.css";
import { FaLaptopCode, FaDatabase, FaPenNib,FaAndroid,FaCogs } from "react-icons/fa";

const Services = () => {
  const servicesData = [
    {
      id: 1,
      title: "Frontend Develop",
      description:
        "With proficiency in HTML, CSS, JavaScript, and React, I create visually appealing and user-friendly frontend experiences that adapt smoothly across devices. My focus is on building responsive and interactive interfaces that enhance user engagement..",
      icon: <FaLaptopCode />,
    },
    {
      id: 2,
      title: "Backend Develop",
      description:
        "Skilled in MongoDB and MySQL, I specialize in backend development. I handle data storage, retrieval, and manipulation, building efficient backend systems for web applications.",
      icon: <FaDatabase />,
    },
    {
      id: 3,
      title: "UI/UX Design",
      description:
        "With a deep understanding of user-centered design principles, I specialize in creating exceptional UI/UX experiences. I collaborate closely with developers and conduct user research to ensure designs meet user needs.",
      icon: <FaPenNib />,
    },
    {
      id: 4,
      title: "Mobile App development",
      description:
        "With a deep understanding of user-centered design principles, I specialize in crafting outstanding UI/UX experiences. I closely collaborate with developers and conduct user research to create mobile applications that are not only functional but also intuitive and engaging.",
      icon: <FaAndroid />,
    },
    {
      id: 5,
      title: "Software development",
      description:
        "With specialized skills in MongoDB and MySQL, I excel in backend development, efficiently handling data storage, retrieval, and manipulation. I create robust and scalable backend systems for web applications, ensuring seamless performance and reliability.",
      icon: <FaCogs />,
    },
  ];

  return (
    <div id="services">
      <div className="services-container ">
        <div className="services-title animated-text">
          <h1 className="services-title1">Our</h1>
          <h1 className="services-title2">Services</h1>
        </div>

        <div className="services-grid">
          {servicesData.map((service) => (
            <div key={service.id} className="service-card ">
              <div className="service-icon animated-text">{service.icon}</div>
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
