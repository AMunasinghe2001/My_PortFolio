// Dynamically fetches all repositories (public and private with GITHUB_TOKEN)
// and their README.md files from GitHub.
//
// Every new repository added to GitHub automatically appears in the portfolio.

const TTL_PROJECTS_MS = 15 * 60 * 1000; // refresh project list every 15 minutes
const TTL_README_MS = 60 * 60 * 1000;   // cache README for 1 hour

// Known custom image covers for existing portfolio projects
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

// Formats repository slugs like "Customs_Yard_Management_System" into clean readable titles
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
        process.env.GITHUB_PAT ||
        process.env.GH_TOKEN ||
        process.env.GITHUB_ACCESS_TOKEN ||
        ""
    ).trim();
    if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
        token = token.slice(1, -1).trim();
    }
    return token;
};

const getGitHubUsername = () => {
    let username = (process.env.GITHUB_USERNAME || "AMunasinghe2001").trim();
    if ((username.startsWith('"') && username.endsWith('"')) || (username.startsWith("'") && username.endsWith("'"))) {
        username = username.slice(1, -1).trim();
    }
    return username;
};

const ghHeaders = (useAuth = true, accept = "application/vnd.github+json") => {
    const headers = {
        Accept: accept,
        "User-Agent": "portfolio-projects-app",
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

let projectsCache = { at: 0, data: [], authenticated: false };
const readmeCache = new Map();

// GET /github-projects
const getGithubProjects = async (req, res) => {
    const now = Date.now();
    const token = getGitHubToken();
    const username = getGitHubUsername();
    const forceRefresh =
        req.query &&
        (req.query.refresh === "true" || req.query.nocache === "1" || req.query.nocache === "true");

    const needsAuthRebuild = token && !projectsCache.authenticated;
    const isCacheStale = now - projectsCache.at >= TTL_PROJECTS_MS;

    if (!forceRefresh && !needsAuthRebuild && !isCacheStale && projectsCache.data.length > 0) {
        return res.status(200).json({
            projects: projectsCache.data,
            authenticated: projectsCache.authenticated,
            cached: true,
        });
    }

    try {
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
                const response = await fetch(url, { headers: ghHeaders(authed) });
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        rawRepos = data;
                        authenticated = authed;
                        break;
                    }
                }
            } catch (err) {
                console.warn(`Failed to fetch from ${url}:`, err.message);
            }
        }

        // Filter out fork copies and the user profile readme repository
        const filtered = rawRepos.filter((repo) => {
            if (repo.fork) return false;
            if (repo.name.toLowerCase() === username.toLowerCase()) return false;
            if (repo.name.toLowerCase() === "desktop-tutorial") return false; // skip initial git test
            return true;
        });

        // Fetch top languages for each repo in parallel to build accurate technology stacks
        const projects = await Promise.all(
            filtered.map(async (repo) => {
                let techList = [];
                try {
                    const langRes = await fetch(repo.languages_url, { headers: ghHeaders(true) });
                    if (langRes.ok) {
                        const langs = await langRes.json();
                        techList = Object.entries(langs)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 4)
                            .map(([l]) => l);
                    }
                } catch {
                    /* ignore language error */
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

        // Sort by most recently updated
        projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        if (projects.length > 0) {
            projectsCache = { at: now, data: projects, authenticated };
        }

        return res.status(200).json({
            projects,
            authenticated,
            cached: false,
        });
    } catch (err) {
        console.error("github-projects error:", err.message);
        if (projectsCache.data.length > 0) {
            return res.status(200).json({
                projects: projectsCache.data,
                authenticated: projectsCache.authenticated,
                cached: true,
            });
        }
        return res.status(500).json({ message: "Failed to fetch GitHub projects", error: err.message });
    }
};

// GET /github-projects/readme?repo=<owner>/<repo>
const getGithubProjectReadme = async (req, res) => {
    const rawRepo = req.query.repo;
    if (!rawRepo) {
        return res.status(400).json({ message: "repo parameter is required" });
    }

    const username = getGitHubUsername();
    const fullName = rawRepo.includes("/") ? rawRepo : `${username}/${rawRepo}`;
    const now = Date.now();

    // Check cache
    const cached = readmeCache.get(fullName);
    if (cached && now - cached.at < TTL_README_MS) {
        return res.status(200).json({ content: cached.content, cached: true });
    }

    try {
        const url = `https://api.github.com/repos/${fullName}/readme`;
        const response = await fetch(url, {
            headers: ghHeaders(true, "application/vnd.github.raw+json"),
        });

        if (!response.ok) {
            if (response.status === 404) {
                return res.status(404).json({ message: "README.md not found in repository", content: null });
            }
            throw new Error(`GitHub README fetch failed (${response.status})`);
        }

        const content = await response.text();
        readmeCache.set(fullName, { at: now, content });

        return res.status(200).json({ content, cached: false });
    } catch (err) {
        console.error(`README fetch error for ${fullName}:`, err.message);
        return res.status(500).json({ message: "Failed to retrieve README", error: err.message });
    }
};

// GET /github-projects/image?repo=<owner>/<repo>&path=<relative/path>&ref=<branch>
// Proxies an image (or any binary asset) from GitHub so private-repo assets
// become viewable in the browser using the server's token.
const getGithubProjectImage = async (req, res) => {
    const rawRepo = req.query.repo;
    const rawPath = req.query.path;
    const ref = (req.query.ref || "").toString().trim() || null;

    if (!rawRepo || !rawPath) {
        return res.status(400).json({ message: "repo and path parameters are required" });
    }

    const username = getGitHubUsername();
    const fullName = rawRepo.includes("/") ? rawRepo : `${username}/${rawRepo}`;
    const cleanPath = rawPath.toString().replace(/^\.?\/+/, "");

    try {
        const url = `https://api.github.com/repos/${fullName}/contents/${encodeURI(cleanPath)}${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`;
        const metaRes = await fetch(url, {
            headers: ghHeaders(true, "application/vnd.github+json"),
        });

        if (!metaRes.ok) {
            return res.status(metaRes.status).json({ message: `GitHub contents fetch failed (${metaRes.status})` });
        }

        const meta = await metaRes.json();

        // Prefer download_url (works for public and signed-for-private LFS/CDN assets)
        if (meta.download_url) {
            const binRes = await fetch(meta.download_url, { headers: ghHeaders(true) });
            if (!binRes.ok) {
                return res.status(binRes.status).json({ message: "Asset download failed" });
            }
            const contentType = binRes.headers.get("content-type") || guessContentType(cleanPath);
            const buffer = Buffer.from(await binRes.arrayBuffer());
            res.setHeader("Content-Type", contentType);
            res.setHeader("Cache-Control", "public, max-age=3600");
            return res.status(200).end(buffer);
        }

        // Fallback: base64 content inline (small files)
        if (meta.content && meta.encoding === "base64") {
            const buffer = Buffer.from(meta.content, "base64");
            res.setHeader("Content-Type", guessContentType(cleanPath));
            res.setHeader("Cache-Control", "public, max-age=3600");
            return res.status(200).end(buffer);
        }

        return res.status(404).json({ message: "Asset not found" });
    } catch (err) {
        console.error(`image proxy error for ${fullName}/${cleanPath}:`, err.message);
        return res.status(500).json({ message: "Failed to retrieve asset", error: err.message });
    }
};

function guessContentType(path) {
    const ext = path.split(".").pop().toLowerCase();
    const map = {
        svg: "image/svg+xml",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        webp: "image/webp",
        ico: "image/x-icon",
        bmp: "image/bmp",
    };
    return map[ext] || "application/octet-stream";
}

module.exports = {
    getGithubProjects,
    getGithubProjectReadme,
    getGithubProjectImage,
};
