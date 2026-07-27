"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import useReveal from "@/lib/useReveal";
import styles from "./Journey.module.css";

const FALLBACK = [
  { title: "Web Design for Beginners", duration: "2024", institution: "University of Moratuwa", logo: "/img/journey/uom.png" },
  { title: "Python for Beginners", duration: "2024", institution: "University of Moratuwa", logo: "/img/journey/uom.png" },
  { title: "Bachelor of Information Technology", duration: "2022 - Present", institution: "Sri Lanka Institute of Information Technology", logo: "/img/journey/sliit.png" },
  { title: "Information Communications Technology", duration: "2017 - 2021", institution: "H/Ruhunu Vijayaba National College", logo: "/img/journey/rvc.png" },
  { title: "Information Communications Technology", duration: "2012 - 2017", institution: "H/Tangalle National Boys School", logo: "/img/journey/tnbs.png" },
];

export default function Journey() {
  const [items, setItems] = useState(FALLBACK);

  useEffect(() => {
    api
      .get("/journey")
      .then((res) => {
        const journey = res.data?.journey;
        if (Array.isArray(journey) && journey.length) setItems(journey);
      })
      .catch((err) => console.error("Journey fetch failed", err));
  }, []);

  useReveal([items]);

  return (
    <section id="journey" className="section">
      <div className="container">
        <span className="eyebrow reveal">Where I&apos;ve been</span>
        <h2 className="section-title reveal">
          <span className="t-light">My</span>
          <span className="t-accent">Journey</span>
        </h2>
        <p className="section-sub reveal">
          Education and milestones that shaped how I build software today.
        </p>

        <div className={styles.timeline}>
          {/* The vertical rail every node hangs off. */}
          <span className={styles.rail} aria-hidden="true" />

          {items.map((item, i) => (
            <div
              key={item._id || i}
              className={`${styles.item} ${i % 2 === 0 ? styles.left : styles.right} reveal`}
            >
              <span className={styles.node} aria-hidden="true" />

              <div className={`glass glass-hover ${styles.card}`}>
                {item.logo && (
                  // Plain <img>: logos come from Cloudinary or /public at
                  // small fixed sizes, so next/image buys nothing here.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.logo} alt="" className={styles.logo} />
                )}
                <h3 className={styles.title}>{item.title}</h3>
                {item.duration && <span className={styles.duration}>{item.duration}</span>}
                {item.institution && <p className={styles.institution}>{item.institution}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
