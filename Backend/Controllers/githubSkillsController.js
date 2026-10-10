// Builds the "Technical Skills" and "Database Management" lists automatically
// from the user's GitHub repositories — including private repositories when a token is configured.
//
//  - Technical Skills  → languages reported by GitHub across all repos (incl. Dart, etc.)
//  - Databases         → detected from each repo's dependency manifest
//                        (package.json / pubspec.yaml / requirements.txt),
//                        PLpgSQL language presence, and repository metadata.
//
// Config (.env or environment variables):
//   GITHUB_USERNAME  GitHub handle to read (default: AMunasinghe2001)
//   GITHUB_TOKEN     Personal Access Token (classic with repo scope, or fine-grained
//                    with Contents: read & Metadata: read). Lifts rate limit and
//                    unlocks private repositories.

const TTL_MS = 6 * 60 * 60 * 1000; // refresh at most every 6 hours
const MAX_SKILLS = 12;

// Tooling/markup/DB-query "languages" we don't want as Technical Skills.
// (PLpgSQL/TSQL/PLSQL are database procedure languages — represented in the
// Database Management section instead.)
const EXCLUDE = new Set([
    "Makefile", "Dockerfile", "Procfile", "Batchfile", "Roff", "Hack", "CMake",
    "PLpgSQL", "TSQL", "PLSQL", "SQLPL", "Jupyter Notebook", "Inno Setup",
]);

// Dependency manifests to inspect per repository (covers monorepos and subfolders)
const PKG_PATHS = [
    "package.json",
    "Backend/package.json", "backend/package.json",
    "server/package.json", "api/package.json",
    "frontend/package.json", "client/package.json",
    "web/package.json", "app/package.json", "src/package.json",
];

const PUB_PATHS = [
    "pubspec.yaml",
    "pubspec.yml",
    "client/pubspec.yaml",
    "app/pubspec.yaml",
    "mobile/pubspec.yaml",
    "frontend/pubspec.yaml",
];

const PY_PATHS = [
    "requirements.txt",
    "Pipfile",
    "pyproject.toml",
    "backend/requirements.txt",
    "server/requirements.txt",
];

// Dependency name (or fragment) → database display name.
const DB_PACKAGE_MAP = [
    {
        name: "PostgreSQL",
        match: [
            "pg", "postgres", "postgresql", "psycopg2", "psycopg",
            "asyncpg", "postgresql2", "dart_postgres", "sql_query_builder",
            "@prisma/client", "pg-promise", "plpgsql"
        ],
    },
    {
        name: "MongoDB",
        match: ["mongodb", "mongoose", "mongo_dart", "pymongo", "motor"],
    },
    {
        name: "Supabase",
        match: ["@supabase/supabase-js", "supabase_flutter", "supabase", "postgrest"],
    },
    {
        name: "MySQL",
        match: ["mysql", "mysql2", "mysql_client", "mysql1", "pymysql", "mysqlclient"],
    },
    {
        name: "Firebase",
        match: [
            "firebase", "firebase-admin", "firebase_core",
            "cloud_firestore", "firebase_database", "firebase_auth"
        ],
    },
    {
        name: "SQLite",
        match: ["sqlite3", "better-sqlite3", "sqflite", "expo-sqlite", "drift", "floor", "sqlite"],
    },
    {
        name: "Redis",
        match: ["redis", "ioredis", "aioredis"],
    },
    {
        name: "SQL Server",
        match: ["mssql", "tedious"],
    },
];

// Helper to retrieve the current GitHub token dynamically from environment variables
const getGitHubToken = () => {
    let token = (
        process.env.GITHUB_TOKEN ||
        process.env.GITHUB_PAT ||
        process.env.GH_TOKEN ||
        process.env.GITHUB_ACCESS_TOKEN ||
        ""
    ).trim();

    // Strip wrapping quotes if user defined e.g. GITHUB_TOKEN="ghp_xxx" in .env
    if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
        token = token.slice(1, -1).trim();
    }
    return token;
};

// Helper to retrieve the username dynamically
const getGitHubUsername = () => {
    let username = (process.env.GITHUB_USERNAME || "AMunasinghe2001").trim();
    if ((username.startsWith('"') && username.endsWith('"')) || (username.startsWith("'") && username.endsWith("'"))) {
        username = username.slice(1, -1).trim();
    }
    return username;
};

// In-memory cache (persists while the serverless instance stays warm).
let cache = { at: 0, data: { skills: [], databases: [], authenticated: false } };

// Build request headers, ensuring Authorization header is properly Bearer formatted
const ghHeaders = (useAuth = true) => {
    const headers = {
        Accept: "application/vnd.github+json",
        "User-Agent": "portfolio-app",
        "X-GitHub-Api-Version": "2022-11-28",
    };

    if (useAuth) {
        const token = getGitHubToken();
        if (token) {
            // Strip any existing "Bearer " or "token " prefix so we don't end up with duplicate prefixes
            const cleanToken = token.replace(/^(Bearer|token)\s+/i, "").trim();
            headers.Authorization = `Bearer ${cleanToken}`;
        }
    }

    return headers;
};

// Helper to fetch paginated repos (up to 500 repositories)
const fetchAllReposFromUrl = async (baseUrl, isAuthed) => {
    let allRepos = [];
    let page = 1;
    const maxPages = 5;

    while (page <= maxPages) {
        const separator = baseUrl.includes("?") ? "&" : "?";
        const pageUrl = `${baseUrl}${separator}page=${page}`;
        const res = await fetch(pageUrl, { headers: ghHeaders(isAuthed) });

        if (!res.ok) {
            if (page === 1) {
                const err = new Error(`GitHub repos request failed (${res.status}): ${res.statusText}`);
                err.status = res.status;
                throw err;
            }
            break;
        }

        const repos = await res.json();
        if (!Array.isArray(repos) || repos.length === 0) break;
        allRepos.push(...repos);
        if (repos.length < 100) break;
        page++;
    }

    return allRepos;
};

// Fetches repositories. If token is available, queries /user/repos to unlock
// PRIVATE repositories as well as public ones.
const fetchRepos = async () => {
    const token = getGitHubToken();
    const username = getGitHubUsername();

    // When token is provided, query /user/repos with visibility=all & affiliation=owner,collaborator
    // to retrieve all personal repositories (public AND private).
    const endpoints = token
        ? [
              {
                  url: "https://api.github.com/user/repos?per_page=100&visibility=all&affiliation=owner,collaborator&sort=updated",
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

    let lastError = null;
    for (const { url, authed } of endpoints) {
        try {
            const repos = await fetchAllReposFromUrl(url, authed);
            if (Array.isArray(repos) && repos.length > 0) {
                return {
                    repos,
                    authenticated: authed,
                };
            }
        } catch (err) {
            lastError = err;
            if (authed && (err.status === 401 || err.status === 403)) {
                console.warn(
                    `[github-skills] GITHUB_TOKEN rejected (${err.status}). Falling back to PUBLIC repos only.\n` +
                    "                Languages and databases in private repos (e.g. Dart, PostgreSQL) will not be visible.\n" +
                    "                Please ensure GITHUB_TOKEN has the 'repo' scope."
                );
            }
        }
    }

    throw lastError || new Error("GitHub repos request failed");
};

// Read a file from a repository (returns its text, or null if missing).
// Always passes auth header if token is available so private repo files can be read.
const fetchManifest = async (fullName, path, useAuth = true) => {
    try {
        const res = await fetch(
            `https://api.github.com/repos/${fullName}/contents/${path}`,
            { headers: ghHeaders(useAuth) }
        );
        if (!res.ok) return null;
        const json = await res.json();
        if (!json.content) return null;
        return Buffer.from(json.content, "base64").toString("utf8");
    } catch {
        return null;
    }
};

// Detect databases from each repository's dependencies, PLpgSQL usage, or topics.
const detectDatabases = async (repos, rawLangsByRepo = {}, useAuth = true) => {
    const counts = {};

    await Promise.all(
        repos.map(async (repo) => {
            const found = new Set();
            const repoLangs = rawLangsByRepo[repo.full_name] || {};

            // 1. Direct language signals: If repo contains PLpgSQL, it uses PostgreSQL.
            if (repoLangs["PLpgSQL"] && repoLangs["PLpgSQL"] > 0) {
                found.add("PostgreSQL");
            }
            if (repoLangs["PLSQL"] || repoLangs["TSQL"]) {
                found.add("SQL Server");
            }

            // 2. package.json dependencies (JS / TS / Node)
            const depKeys = new Set();
            const pkgs = await Promise.all(
                PKG_PATHS.map((p) => fetchManifest(repo.full_name, p, useAuth))
            );
            for (const pkg of pkgs) {
                if (!pkg) continue;
                try {
                    const j = JSON.parse(pkg);
                    for (const k of [
                        ...Object.keys(j.dependencies || {}),
                        ...Object.keys(j.devDependencies || {}),
                    ]) {
                        depKeys.add(k.toLowerCase());
                    }
                } catch {
                    /* ignore malformed package.json */
                }
            }

            // 3. pubspec.yaml dependencies (Flutter / Dart)
            const pubs = await Promise.all(
                PUB_PATHS.map((p) => fetchManifest(repo.full_name, p, useAuth))
            );
            const pubText = pubs.filter(Boolean).join("\n").toLowerCase();

            // 4. Python dependencies (requirements.txt / Pipfile / pyproject.toml)
            const pyFiles = await Promise.all(
                PY_PATHS.map((p) => fetchManifest(repo.full_name, p, useAuth))
            );
            const pyText = pyFiles.filter(Boolean).join("\n").toLowerCase();

            // 5. Repo metadata (topics, name, description)
            const metaText = [
                repo.name,
                repo.description || "",
                ...(Array.isArray(repo.topics) ? repo.topics : []),
            ].join(" ").toLowerCase();

            for (const { name, match } of DB_PACKAGE_MAP) {
                const hit = match.some((m) => {
                    const lowerM = m.toLowerCase();
                    return (
                        depKeys.has(lowerM) ||
                        pubText.includes(lowerM) ||
                        pyText.includes(lowerM) ||
                        metaText.includes(lowerM)
                    );
                });
                if (hit) found.add(name);
            }

            for (const name of found) {
                counts[name] = (counts[name] || 0) + 1;
            }
        })
    );

    const entries = Object.entries(counts);
    if (!entries.length) return [];

    // Scale against the most-used database so the top database reads 100%
    const maxCount = Math.max(...entries.map(([, c]) => c));
    return entries
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([title, count]) => ({
            title,
            percentage: Math.max(1, Math.round((count / maxCount) * 100)),
            category: "database",
        }));
};

const buildData = async () => {
    // 1) List repositories. With a token, we read the authenticated user's repositories
    //    including PRIVATE ones (like Customs_Yard_Management_System).
    const { repos, authenticated } = await fetchRepos();

    // Skip forks to only represent the user's own work
    const sources = Array.isArray(repos) ? repos.filter((r) => !r.fork) : [];

    // 2) Sum the bytes-per-language across every repository.
    // Always use ghHeaders(true) so private repo language URLs are authorized!
    const totals = {};
    const rawLangsByRepo = {};

    await Promise.all(
        sources.map(async (repo) => {
            try {
                const res = await fetch(repo.languages_url, { headers: ghHeaders(true) });
                if (!res.ok) return;
                const langs = await res.json();
                rawLangsByRepo[repo.full_name] = langs;

                for (const [lang, bytes] of Object.entries(langs)) {
                    if (EXCLUDE.has(lang)) continue;
                    totals[lang] = (totals[lang] || 0) + bytes;
                }
            } catch {
                /* ignore a single repo request error */
            }
        })
    );

    const entries = Object.entries(totals);
    let skills = [];
    if (entries.length) {
        const grandTotal = entries.reduce((s, [, b]) => s + b, 0);
        const maxBytes = Math.max(...entries.map(([, b]) => b));

        skills = entries
            .filter(([, b]) => b / grandTotal >= 0.005) // Include any language >= 0.5% of total
            .sort((a, b) => b[1] - a[1])
            .slice(0, MAX_SKILLS)
            .map(([title, bytes]) => ({
                title,
                percentage: Math.max(1, Math.round((bytes / maxBytes) * 100)),
                category: "technical",
            }));
    }

    // 3) Detect databases — passing raw language data for PLpgSQL detection
    let databases = [];
    try {
        databases = await detectDatabases(sources, rawLangsByRepo, true);
    } catch (err) {
        console.error("detectDatabases error:", err.message);
        databases = [];
    }

    return { skills, databases, authenticated };
};

// GET /github-skills  (public endpoint)
const getGithubSkills = async (req, res) => {
    const now = Date.now();
    const hasData = cache.data.skills.length > 0 || cache.data.databases.length > 0;
    const forceRefresh =
        req.query &&
        (req.query.refresh === "true" || req.query.nocache === "1" || req.query.nocache === "true");

    // If cache is present, fresh, and was built with authentication, serve it
    const token = getGitHubToken();
    const isCacheStale = now - cache.at >= TTL_MS;
    // Invalidate cache if the token is present now but cache was populated unauthenticated
    const needsAuthRebuild = token && !cache.data.authenticated;

    if (!forceRefresh && !needsAuthRebuild && !isCacheStale && hasData) {
        return res.status(200).json({ ...cache.data, cached: true });
    }

    if (typeof fetch !== "function") {
        return res.status(200).json({ ...cache.data, unsupported: true });
    }

    try {
        const data = await buildData();
        if (data.skills.length || data.databases.length) {
            cache = { at: now, data };
        }
        return res.status(200).json({ ...data, cached: false });
    } catch (err) {
        console.error("github-skills error:", err.message);
        return res.status(200).json({ ...cache.data, error: true });
    }
};

module.exports = { getGithubSkills };
