"use client";

import Link from "next/link";
import {
  FaUser,
  FaBriefcase,
  FaChartBar,
  FaGraduationCap,
  FaTools,
  FaLock,
  FaArrowRight,
} from "react-icons/fa";
import { PageHeader } from "@/components/admin/ui";
import styles from "./dashboard.module.css";

const SECTIONS = [
  { href: "/admin/profile", title: "Profile & Hero", desc: "Name, titles, intro, about, social links, resume & images", Icon: FaUser },
  { href: "/admin/projects", title: "Projects", desc: "Add, edit or delete portfolio projects", Icon: FaBriefcase },
  { href: "/admin/skills", title: "Skills", desc: "Tools & professional bars (tech & databases auto from GitHub)", Icon: FaChartBar },
  { href: "/admin/journey", title: "Journey", desc: "Education & timeline entries", Icon: FaGraduationCap },
  { href: "/admin/services", title: "Services", desc: "Service cards shown on the site", Icon: FaTools },
  { href: "/admin/account", title: "Account", desc: "Change your admin username & password", Icon: FaLock },
];

export default function AdminHomePage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Manage every section of your portfolio. Changes go live immediately."
      />

      <div className={styles.grid}>
        {SECTIONS.map(({ href, title, desc, Icon }) => (
          <Link key={href} href={href} className={`glass glass-hover ${styles.card}`}>
            <span className={styles.icon}>
              <Icon />
            </span>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.desc}>{desc}</p>
            <span className={styles.go}>
              Open <FaArrowRight />
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
