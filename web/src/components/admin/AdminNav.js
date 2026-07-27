"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { FaExternalLinkAlt, FaSignOutAlt, FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "@/lib/AuthContext";
import styles from "./AdminNav.module.css";

const LINKS = [
  { href: "/admin", label: "Home" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/skills", label: "Skills" },
  { href: "/admin/journey", label: "Journey" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/account", label: "Account" },
];

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { username, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = (href) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className={styles.header}>
      <nav className={`glass ${styles.bar}`}>
        <button
          className={styles.burger}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>

        <ul className={`${styles.links} ${open ? styles.linksOpen : ""}`}>
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${styles.link} ${isActive(link.href) ? styles.active : ""}`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.right}>
          <span className={styles.user}>
            <FaUserCircle /> {username || "admin"}
          </span>
          <Link href="/" className="btn btn-glass btn-sm">
            View Site <FaExternalLinkAlt />
          </Link>
          <button className="btn btn-danger btn-sm" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </nav>
    </header>
  );
}
