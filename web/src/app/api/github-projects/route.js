export const dynamic = "force-dynamic";
export const revalidate = 0;

// Next.js Route Handler for fetching GitHub repositories (including private with GITHUB_TOKEN)
// Any new repository created on GitHub will automatically appear here.

const KNOWN_IMAGES = {
  my_portfolio: "/img/projects/portfolio.jpg",
  hotelbookingsystem: "/img/projects/hotelbook.jpg",
  taskmasterapp: "/img/projects/todo app.jpg",
  game_app: "/img/projects/game app.jpg",
  "book-tour-website-oop": "/img/projects/oop.jpg",
  "rukshan-furniture": "/img/projects/itp.jpg",
  "share_me-app": "/img/projects/PAF.png",
  itpm_project: "/img/projects/ITPM.png",
};

// Custom metadata overrides so cards display rich, accurate titles and descriptions matching their README
const PROJECT_OVERRIDES = {
  "desktop-learn_control_panel": {
    title: "SLCHRD LMS v2.0",
    description:
      "An Enterprise Desktop Learning Management System engineered for Sri Lanka Customs to manage officer training programs, academic curricula, resource persons, training costs, and reporting.",
    technology: "Java Swing | FlatLaf | MySQL 8.x | Apache PDFBox",
  },
  "customs_yard_management_system": {
    title: "Customs Yard Management System",
    description:
      "An Enterprise Windows Desktop Platform for Seizure Report (SR) Operations, Multi-Yard Warehouse Inventory, Accrued Storage Charges, and Security Workflows.",
    technology: "Dart | Python | PLpgSQL",
  },
  "librarymanagementsystem_sl_customs": {
    title: "Customs Library Management System",
    description:
      "A comprehensive Library Management System engineered for Sri Lanka Customs to streamline book indexing, patron registrations, and borrowing workflows.",
    technology: "Python | MySQL | PyQt | Inno Setup",
  },
  "librarymanagementsystem_ambalantota_ps": {
    title: "Library Management System (Ambalantota PS)",
    description:
      "A desktop-based Library Management System built with Electron.js and PostgreSQL for Ambalantota Pradeshiya Sabha.",
    technology: "JavaScript | Electron | PostgreSQL",
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

export async function GET() {
  try {
    const token = getGitHubToken();
    const username = getGitHubUsername();

    const endpoints = token
      ? [
          {
            url: "https://api.github.com/user/repos?per_page=100&visibility=all&affiliation=owner&sort=updated",
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
        /* try next endpoint */
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
        const override = PROJECT_OVERRIDES[lowerName];

        const title = override?.title || formatTitle(repo.name);
        const description =
          override?.description ||
          repo.description ||
          `A ${techList[0] || "software"} project developed by Anushanga Munasinghe.`;
        const technology =
          override?.technology ||
          (techList.length > 0 ? techList.join(" | ") : "Software Development");
        const matchedImage = KNOWN_IMAGES[lowerName] || null;

        return {
          _id: repo.node_id || String(repo.id),
          id: repo.id,
          title,
          repoName: repo.full_name,
          rawName: repo.name,
          description,
          technology,
          techList,
          url: repo.html_url,
          liveUrl: repo.homepage || "",
          isPrivate: Boolean(repo.private),
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          image: matchedImage,
          updatedAt: repo.pushed_at || repo.updated_at,
          createdAt: repo.created_at,
        };
      })
    );

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
