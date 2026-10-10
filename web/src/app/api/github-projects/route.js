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
        const res = await fetch(url, { headers: ghHeaders(authed), next: { revalidate: 900 } });
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
      if (repo.name.toLowerCase() === username.toLowerCase()) return false;
      if (repo.name.toLowerCase() === "desktop-tutorial") return false;
      return true;
    });

    const projects = await Promise.all(
      filtered.map(async (repo) => {
        let techList = [];
        try {
          const langRes = await fetch(repo.languages_url, {
            headers: ghHeaders(true),
            next: { revalidate: 3600 },
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

        const technology = techList.length > 0 ? techList.join(" | ") : "Software Development";
        const lowerName = repo.name.toLowerCase();
        const matchedImage = KNOWN_IMAGES[lowerName] || null;

        return {
          _id: repo.node_id || String(repo.id),
          id: repo.id,
          title: formatTitle(repo.name),
          repoName: repo.full_name,
          rawName: repo.name,
          description:
            repo.description ||
            `A ${techList[0] || "software"} project developed by Anushanga Munasinghe.`,
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
