"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { FaBars, FaTimes } from "react-icons/fa";
import styles from "./Nav.module.css";

const LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "journey", label: "Journey" },
  { id: "skills", label: "Skills" },
  { id: "project", label: "Project" },
  { id: "services", label: "Services" },
  { id: "contact", label: "Hire Me" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  // Tighten the bar once the page scrolls away from the hero.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the link for the section currently under the top of the viewport.
  //
  // Measuring positions directly on scroll rather than using
  // IntersectionObserver ratios: sections here differ hugely in height, so the
  // "most visible" section was often not the one being read — a short section
  // could never out-score a tall neighbour, leaving the highlight stuck.
  useEffect(() => {
    const getSections = () =>
      LINKS.map((l) => document.getElementById(l.id)).filter(Boolean);

    const update = () => {
      const sections = getSections();
      if (!sections.length) return;

      // Pick the section whose top is nearest the reading line just below the
      // navbar. A simple "last section above the line" test doesn't work here:
      // sections carry large vertical padding, so after an anchor scroll a
      // section's box top sits well below the navbar even though it is the one
      // on screen — that lagged the highlight a full section behind.
      const navH =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--nav-h")
        ) || 74;
      const line = navH + 40;

      let current = sections[0].id;
      let best = Infinity;
      for (const el of sections) {
        // getBoundingClientRect is viewport-relative, so it stays correct
        // regardless of offset parents or transforms on ancestors.
        const top = el.getBoundingClientRect().top;
        // Sections already scrolled past are penalised so the upcoming one
        // only takes over as it actually arrives.
        const distance = top <= line ? line - top : (top - line) * 3;
        if (distance < best) {
          best = distance;
          current = el.id;
        }
      }

      // At the very bottom the last section may be too short to ever cross the
      // line, so select it explicitly.
      const atBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;
      if (atBottom) current = sections[sections.length - 1].id;

      setActive(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const goToSection = useCallback((e, id) => {
    e.preventDefault();
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push("/");
  };

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
        <nav className={styles.bar}>
          <a
            href="#home"
            className={styles.brand}
            onClick={(e) => goToSection(e, "home")}
          >
            <span className={styles.brandMark}>AM</span>
            <span className={styles.brandText}>Anushanga</span>
          </a>

          <ul className={styles.links}>
            {LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  className={`${styles.link} ${active === link.id ? styles.active : ""}`}
                  onClick={(e) => goToSection(e, link.id)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            {isAuthenticated ? (
              <>
                <button
                  className={`btn btn-glass btn-sm ${styles.deskAction}`}
                  onClick={() => router.push("/admin")}
                >
                  Dashboard
                </button>
                <button
                  className={`btn btn-glass btn-sm ${styles.deskAction}`}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                className={`btn btn-primary btn-sm ${styles.deskAction}`}
                onClick={() => router.push("/login")}
              >
                Login
              </button>
            )}

            <button
              className={styles.burger}
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile sheet */}
      <div
        className={`${styles.scrim} ${open ? styles.scrimOpen : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside className={`${styles.sheet} ${open ? styles.sheetOpen : ""}`}>
        <ul className={styles.sheetLinks}>
          {LINKS.map((link, i) => (
            <li key={link.id} style={{ transitionDelay: `${0.05 + i * 0.04}s` }}>
              <a
                href={`#${link.id}`}
                className={`${styles.sheetLink} ${active === link.id ? styles.active : ""}`}
                onClick={(e) => goToSection(e, link.id)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className={styles.sheetActions}>
          {isAuthenticated ? (
            <>
              <button
                className="btn btn-glass"
                onClick={() => {
                  setOpen(false);
                  router.push("/admin");
                }}
              >
                Dashboard
              </button>
              <button className="btn btn-glass" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => {
                setOpen(false);
                router.push("/login");
              }}
            >
              Login
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
