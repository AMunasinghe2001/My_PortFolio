"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import useReveal from "@/lib/useReveal";
import { renderServiceIcon } from "@/lib/serviceIcons";
import styles from "./Services.module.css";

const FALLBACK = [
  { title: "Frontend Development", icon: "FaLaptopCode", description: "With proficiency in HTML, CSS, JavaScript, and React, I create visually appealing and user-friendly frontend experiences that adapt smoothly across devices. My focus is on building responsive and interactive interfaces that enhance user engagement." },
  { title: "Backend Development", icon: "FaDatabase", description: "Skilled in MongoDB and MySQL, I specialize in backend development. I handle data storage, retrieval, and manipulation, building efficient backend systems for web applications." },
  { title: "UI/UX Design", icon: "FaPenNib", description: "With a deep understanding of user-centered design principles, I specialize in creating exceptional UI/UX experiences. I collaborate closely with developers and conduct user research to ensure designs meet user needs." },
  { title: "Mobile App Development", icon: "FaAndroid", description: "I build mobile applications that are not only functional but also intuitive and engaging, collaborating closely with developers and conducting user research throughout." },
  { title: "Software Development", icon: "FaCogs", description: "With specialized skills in MongoDB and MySQL, I excel in backend development, creating robust and scalable systems for web applications with seamless performance and reliability." },
];

export default function Services() {
  const [services, setServices] = useState(FALLBACK);

  useEffect(() => {
    api
      .get("/services")
      .then((res) => {
        const data = res.data?.services;
        if (Array.isArray(data) && data.length) setServices(data);
      })
      .catch((err) => console.error("Services fetch failed", err));
  }, []);

  useReveal([services]);

  return (
    <section id="services" className="section">
      <div className="container">
        <span className="eyebrow reveal">How I can help</span>
        <h2 className="section-title reveal">
          <span className="t-light">My</span>
          <span className="t-accent">Services</span>
        </h2>
        <p className="section-sub reveal">
          End-to-end product work — from the first wireframe to the deployed application.
        </p>

        <div className={styles.grid}>
          {services.map((service, i) => (
            <article
              key={service._id || i}
              className={`glass glass-hover ${styles.card} reveal`}
              style={{ transitionDelay: `${(i % 3) * 0.08}s` }}
            >
              <span className={styles.icon} aria-hidden="true">
                {renderServiceIcon(service.icon)}
              </span>
              <h3 className={styles.title}>{service.title}</h3>
              <p className={styles.desc}>{service.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
