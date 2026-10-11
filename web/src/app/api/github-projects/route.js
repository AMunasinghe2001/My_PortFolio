export const dynamic = "force-dynamic";
export const revalidate = 0;

// Next.js Route Handler for fetching GitHub repositories (including private, collaborator & group repos)
// Synchronized with Admin Panel (MongoDB) overrides for custom images, titles, and descriptions.

const KNOWN_IMAGES = {
  my_portfolio: "/img/projects/portfolio.jpg",
  hotelbookingsystem: "/img/projects/hotelbook.jpg",
  taskmasterapp: "/img/projects/todo app.jpg",
  game_app: "/img/projects/game app.jpg",
  "book-tour-website-oop": "/img/projects/oop.jpg",
  "rukshan-furniture": "/img/projects/itp.jpg",
  "rukshan-furniture-demo": "/img/projects/rukshanferniture.jpg",
  "share_me-app": "/img/projects/PAF.png",
  itpm_project: "/img/projects/ITPM.png",
};

// Base overrides for clean titles and descriptions
const PROJECT_OVERRIDES = {
  "desktop-learn_control_panel": {
    title: "SLCHRD LMS v2.0",
    description:
      "An Enterprise Desktop Learning Management System engineered for Sri Lanka Customs to manage officer training programs, academic curricula, resource persons, training costs, and reporting.",
    technology: "Java Swing | FlatLaf | MySQL 8.x | Apache PDFBox",
  },
  customs_yard_management_system: {
    title: "Customs Yard Management System",
    description:
      "An Enterprise Windows Desktop Platform for Seizure Report (SR) Operations, Multi-Yard Warehouse Inventory, Accrued Storage Charges, and Security Workflows.",
    technology: "Dart | Python | PLpgSQL",
  },
  librarymanagementsystem_sl_customs: {
    title: "Customs Library Management System",
    description:
      "A comprehensive Library Management System engineered for Sri Lanka Customs to streamline book indexing, patron registrations, and borrowing workflows.",
    technology: "Python | MySQL | PyQt | Inno Setup",
  },
  librarymanagementsystem_ambalantota_ps: {
    title: "Library Management System (Ambalantota PS)",
    description:
      "A desktop-based Library Management System built with Electron.js and PostgreSQL for Ambalantota Pradeshiya Sabha.",
    technology: "JavaScript | Electron | PostgreSQL",
  },
  "share_me-app": {
    title: "Share me Web",
    description: "Social media and sharing platform built collaboratively with React and Spring Boot.",
    technology: "React | Spring Boot | MySQL",
  },
  itpm_project: {
    title: "Home Stock Web App",
    description: "Smart Home Stock and Inventory Management System built with the MERN Stack.",
    technology: "MongoDB | Express | React | Node.js",
  },
  "rukshan-furniture": {
    title: "Furniture Manage Web App",
    description: "Online furniture manufacturing and showroom management web application built with MERN Stack.",
    technology: "MongoDB | Express | React | Node.js",
  },
  "rukshan-furniture-demo": {
    title: "Rukshan Furniture Web",
    description: "Modern furniture catalogue and customer ordering portal built with React, Vite, and Node.js.",
    technology: "React | Vite | MERN Stack",
  },
  "mtit_assignment": {
    title: "Microservices Platform (MTIT)",
    description: "Enterprise Distributed Architecture assignment with Node.js and Microservices.",
    technology: "Node.js | Express | Microservices",
  },
  final_year_research: {
    title: "Final Year Research Project",
    description: "Undergraduate Academic Research & System Implementation.",
    technology: "Python | Machine Learning | Research",
  },
};

const formatTitle = (name) => {
  if (!name) return "";
  return name
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b([A-Z]{2,})\b/g, (m) => m)
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
};

const getGitHubToken = () => {
  let token = (
    process.env.GITHUB_TOKEN ||
    process.env.NEXT_PUBLIC_GITHUB_TOKEN ||
    process.env.GITHUB_PAT ||
    process.env.GH_TOKEN ||
    ""
  ).trim();
  if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
    token = token.slice(1, -1).trim();
  }
  return token;
};

const getGitHubUsername = () => {
  let username = (
    process.env.GITHUB_USERNAME ||
    process.env.NEXT_PUBLIC_GITHUB_USERNAME ||
    "AMunasinghe2001"
  ).trim();
  if ((username.startsWith('"') && username.endsWith('"')) || (username.startsWith("'") && username.endsWith("'"))) {
    username = username.slice(1, -1).trim();
  }
  return username;
};

const ghHeaders = (useAuth = true, accept = "application/vnd.github+json") => {
  const headers = {
    Accept: accept,
    "User-Agent": "portfolio-web-projects",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (useAuth) {
    const token = getGitHubToken();
    if (token) {
      const cleanToken = token.replace(/^(Bearer|token)\s+/i, "").trim();
      headers.Authorization = `Bearer ${cleanToken}`;
    }
  }

  return headers;
};

// Fetch admin/MongoDB projects from backend API to apply admin overrides
const fetchAdminProjects = async () => {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://my-port-folio-livid.vercel.app";
    const res = await fetch(`${backendUrl}/projects?t=${Date.now()}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data.projects) ? data.projects : [];
    }
  } catch {}
  return [];
};

export async function GET() {
  try {
    const token = getGitHubToken();
    const username = getGitHubUsername();

    // Include owner, collaborator, and organization_member repos
    const endpoints = token
      ? [
          {
            url: "https://api.github.com/user/repos?per_page=100&visibility=all&affiliation=owner,collaborator,organization_member&sort=updated",
            authed: true,
          },
          {
            url: `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
            authed: false,
          },
        ]
      : [
          {
            url: `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
            authed: false,
          },
        ];

    let rawRepos = [];
    let authenticated = false;

    for (const { url, authed } of endpoints) {
      try {
        const res = await fetch(url, { headers: ghHeaders(authed), cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            rawRepos = data;
            authenticated = authed;
            break;
          }
        }
      } catch {
        /* try next */
      }
    }

    const filtered = rawRepos.filter((repo) => {
      if (repo.fork) return false;
      const lower = repo.name.toLowerCase();
      if (lower === username.toLowerCase()) return false;
      if (lower === "desktop-tutorial") return false;
      // Filter out deleted/obsolete repos
      if (
        lower === "slchrd_lms.2.0" ||
        lower === "slchrd-lms.2.0" ||
        lower === "slchrd_lms" ||
        lower.replace(/[-_.]/g, "") === "slchrdlms20"
      ) {
        return false;
      }
      return true;
    });

    // Also fetch Admin Panel projects to enable live overrides
    const adminProjects = await fetchAdminProjects();

    const projects = await Promise.all(
      filtered.map(async (repo) => {
        let techList = [];
        try {
          const langRes = await fetch(repo.languages_url, {
            headers: ghHeaders(true),
            cache: "no-store",
          });
          if (langRes.ok) {
            const langs = await langRes.json();
            techList = Object.entries(langs)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4)
              .map(([l]) => l);
          }
        } catch {
          /* ignore */
        }

        if (!techList.length && repo.language) {
          techList = [repo.language];
        }

        const lowerName = repo.name.toLowerCase();
        const baseOverride = PROJECT_OVERRIDES[lowerName];

        // Check if an Admin Panel entry matches this repo
        const repoUrlLower = (repo.html_url || "").toLowerCase();
        const adminMatch = adminProjects.find((ap) => {
          if (ap.url && ap.url.toLowerCase() === repoUrlLower) return true;
          if (ap.rawName && ap.rawName.toLowerCase() === lowerName) return true;
          if (ap.title && ap.title.toLowerCase() === lowerName) return true;
          return false;
        });

        // Priority: Admin Panel edit > Config override > GitHub metadata
        const title =
          adminMatch?.title || baseOverride?.title || formatTitle(repo.name);
        const description =
          adminMatch?.description ||
          baseOverride?.description ||
          repo.description ||
          `A ${techList[0] || "software"} project developed by Anushanga Munasinghe.`;
        const technology =
          adminMatch?.technology ||
          baseOverride?.technology ||
          (techList.length > 0 ? techList.join(" | ") : "Software Development");
        const image =
          adminMatch?.image || KNOWN_IMAGES[lowerName] || null;
        const liveUrl = adminMatch?.liveUrl || repo.homepage || "";

        const isCollaborator =
          Boolean(repo.owner && repo.owner.login && repo.owner.login.toLowerCase() !== username.toLowerCase());

        return {
          _id: repo.node_id || String(repo.id),
          id: repo.id,
          title,
          repoName: repo.full_name,
          rawName: repo.name,
          owner: repo.owner?.login || username,
          isCollaborator,
          description,
          technology,
          techList,
          url: repo.html_url,
          liveUrl,
          isPrivate: Boolean(repo.private),
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          image,
          updatedAt: repo.pushed_at || repo.updated_at,
          createdAt: repo.created_at,
        };
      })
    );

    // Also include any Admin Panel projects that are not linked to a GitHub repo
    for (const ap of adminProjects) {
      const alreadyIncluded = projects.some(
        (p) =>
          (ap.url && p.url && ap.url.toLowerCase() === p.url.toLowerCase()) ||
          (ap.title && p.title && ap.title.toLowerCase() === p.title.toLowerCase())
      );
      if (!alreadyIncluded && ap.title) {
        projects.push({
          _id: ap._id || String(Math.random()),
          id: ap._id || String(Math.random()),
          title: ap.title,
          repoName: ap.url ? ap.url.replace(/^https?:\/\/github\.com\//i, "") : "",
          rawName: ap.title,
          isCollaborator: false,
          description: ap.description || `Project developed by Anushanga Munasinghe.`,
          technology: ap.technology || "Software Development",
          techList: ap.technology ? ap.technology.split("|").map((s) => s.trim()) : [],
          url: ap.url || "",
          liveUrl: ap.liveUrl || "",
          isPrivate: false,
          image: ap.image || null,
          updatedAt: ap.updatedAt || ap.createdAt || new Date().toISOString(),
          createdAt: ap.createdAt || new Date().toISOString(),
        });
      }
    }

    projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return Response.json({
      projects,
      authenticated,
    });
  } catch (err) {
    return Response.json(
      { message: "Failed to fetch GitHub projects", error: err.message, projects: [] },
      { status: 500 }
    );
  }
}
