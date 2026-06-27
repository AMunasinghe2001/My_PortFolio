import React, { useEffect, useState } from "react";
import Nav from "../Nav/nav";
import { getCachedProfile, fetchProfile } from "../../api/profile";
import "./home.css";
import picFallback from "./img/pic.png";

const fallbackProfile = {
  greeting: "Hello, It's Me...",
  name: "Anushanga Munasinghe",
  jobTitles: [
    "Frontend Developer",
    "Backend Developer",
    "UI/UX Designer",
    "Mobile App Developer",
    "Software Developer",
  ],
  intro:
    "Welcome to my portfolio! I'm a full-stack developer, UI/UX designer and Mobile app developer passionate about crafting exceptional digital experiences. Browse through my work and discover my expertise in front-end development and design. Let's create something extraordinary together!",
  resumeUrl: "/Anushanga Munasinghe CV.pdf",
  heroImage: "",
};

function Home() {
  // Start from the cached profile (if any) so reloads show the correct hero
  // image immediately instead of flashing the old bundled one first.
  const [profile, setProfile] = useState(() => ({
    ...fallbackProfile,
    ...(getCachedProfile() || {}),
  }));

  // Typing animation state
  const [currentTitle, setCurrentTitle] = useState("");
  const [titleIndex, setTitleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const jobTitles =
    profile.jobTitles && profile.jobTitles.length
      ? profile.jobTitles
      : fallbackProfile.jobTitles;

  // Build a resume link that downloads as a properly-named PDF. For Cloudinary
  // URLs we add fl_attachment (forces a download with a filename); for the
  // bundled/static PDF the `download` attribute below handles the name.
  const resumeHref = (() => {
    const url = profile.resumeUrl || fallbackProfile.resumeUrl;
    if (url && url.includes("res.cloudinary.com") && url.includes("/upload/")) {
      let u = url.replace("/upload/", "/upload/fl_attachment:Anushanga-Munasinghe-CV/");
      if (!/\.pdf(\?|$)/i.test(u)) u += ".pdf";
      return u;
    }
    return url;
  })();

  useEffect(() => {
    fetchProfile()
      .then((p) => {
        if (p) setProfile((prev) => ({ ...prev, ...p }));
      })
      .catch((error) => console.error("Profile fetch failed", error));
  }, []);

  // Restart the typing animation whenever the set of titles changes.
  useEffect(() => {
    setCurrentTitle("");
    setTitleIndex(0);
    setCharIndex(0);
    setIsDeleting(false);
    setIsPaused(false);
  }, [profile.jobTitles]);

  useEffect(() => {
    if (isPaused) return;

    const activeTitle = jobTitles[titleIndex] || jobTitles[0] || "";

    const typeTimeout = setTimeout(() => {
      if (!isDeleting) {
        setCurrentTitle((prev) => prev + activeTitle.charAt(charIndex));
        setCharIndex((prev) => prev + 1);

        if (charIndex === activeTitle.length) {
          setIsPaused(true);
          setTimeout(() => {
            setIsPaused(false);
            setIsDeleting(true);
          }, 2000);
        }
      } else {
        setCurrentTitle((prev) => prev.slice(0, -1));
        setCharIndex((prev) => prev - 1);

        if (charIndex === 0) {
          setIsDeleting(false);
          setTitleIndex((prev) => (prev + 1) % jobTitles.length);
        }
      }
    }, isDeleting ? 100 : 150);

    return () => clearTimeout(typeTimeout);
  }, [charIndex, isDeleting, isPaused, titleIndex, jobTitles]);

  return (
    <div id="home">
      <Nav />
      <div className="cover">
        <div className="header">
          <h2 className="homeh2 animated-text">{profile.greeting}</h2>
          <br />

          <div className="name animated-text">
            <h1>{profile.name}</h1>
            <br />
          </div>
          <h2 className="homeh2 animated-text">And I'm</h2>
          <br />
          <div className="job animated-text">
            <h1>
              &shy;{currentTitle}
              <span className="cursor">|</span>
            </h1>
            <br />
          </div>
          <div className="homeAbout animated-text">
            <p>{profile.intro}</p>
          </div>

          <button className="btnCV animated-text">
            <a href={resumeHref} download="Anushanga-Munasinghe-CV.pdf">
              Download Resume <i className="fas fa-download"></i>
            </a>
          </button>
        </div>
        <div className="pic">
          <img src={profile.heroImage || picFallback} alt="home pic" />
        </div>
      </div>
    </div>
  );
}

export default Home;
