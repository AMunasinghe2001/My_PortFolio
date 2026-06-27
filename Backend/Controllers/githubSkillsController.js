// Builds the "Technical Skills" and "Database Management" lists automatically
// from the user's GitHub repositories — no admin entry needed.
//
//  - Technical Skills  → languages reported by GitHub across the repos.
//  - Databases         → detected from each repo's dependency manifest
//                        (package.json / pubspec.yaml). Needs a token.
//
// Config (optional .env):
//   GITHUB_USERNAME  GitHub handle to read (default below)
//   GITHUB_TOKEN     personal access token (scope: repo). Lifts the rate
//                    limit to 5000/hr AND unlocks private repos + database
//                    detection. Strongly recommended.

const USERNAME = process.env.GITHUB_USERNAME || "AMunasinghe2001";
const TOKEN = process.env.GITHUB_TOKEN || "";
const TTL_MS = 6 * 60 * 60 * 1000; // refresh at most every 6 hours
const MAX_SKILLS = 10;

// Tooling/markup/DB-query "languages" we don't want as Technical Skills.
// (PLpgSQL/TSQL/PLSQL are database procedure languages — represented in the
// Database Management section instead.)
const EXCLUDE = new Set([
    "Makefile", "Dockerfile", "Procfile", "Batchfile", "Roff", "Hack", "CMake",
    "PLpgSQL", "TSQL", "PLSQL", "SQLPL",
]);

// Dependency manifests to look at per repo (covers monorepos where the JS app
// lives in a sub-folder like Backend/ or server/).
const PKG_PATHS = [
    "package.json",
    "Backend/package.json", "backend/package.json",
    "server/package.json", "api/package.json",
    "frontend/package.json", "client/package.json",
];
const PUB_PATHS = ["pubspec.yaml"];

// Dependency name (or fragment) → database display name.
const DB_PACKAGE_MAP = [
    { name: "MongoDB", match: ["mongodb", "mongoose", "mongo_dart"] },
    { name: "Supabase", match: ["@supabase/supabase-js", "supabase_flutter", "supabase"] },
    { name: "Firebase", match: ["firebase", "firebase-admin", "firebase_core", "cloud_firestore", "firebase_database"] },
    { name: "MySQL", match: ["mysql", "mysql2"] },
    { name: "PostgreSQL", match: ["pg", "postgres", "postgresql"] },
    { name: "SQLite", match: ["sqlite3", "better-sqlite3", "sqflite", "expo-sqlite"] },
    { name: "Redis", match: ["redis", "ioredis"] },
    { name: "SQL Server", match: ["mssql", "tedious"] },
];

// In-memory cache (persists while the serverless instance stays warm).
let cache = { at: 0, data: { skills: [], databases: [] } };

const ghHeaders = () => {
    const h = {
        Accept: "application/vnd.github+json",
        "User-Agent": "portfolio-app",
    };
    if (TOKEN) h.Authorization = `Bearer ${TOKEN}`;
    return h;
};

// Read a file from a repo (returns its text, or null if missing).
const fetchManifest = async (fullName, path) => {
    try {
        const res = await fetch(
            `https://api.github.com/repos/${fullName}/contents/${path}`,
            { headers: ghHeaders() }
        );
        if (!res.ok) return null;
        const json = await res.json();
        if (!json.content) return null;
        return Buffer.from(json.content, "base64").toString("utf8");
    } catch {
        return null;
    }
};

// Detect databases from each repo's package.json / pubspec.yaml dependencies.
const detectDatabases = async (repos) => {
    const counts = {};
    await Promise.all(
        repos.map(async (repo) => {
            const found = new Set();

            // package.json (root + common sub-folders) — match dependency KEYS
            // exactly to avoid false hits on short names like "pg".
            const depKeys = new Set();
            const pkgs = await Promise.all(
                PKG_PATHS.map((p) => fetchManifest(repo.full_name, p))
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
                    /* malformed package.json — ignore */
                }
            }

            // pubspec.yaml (Flutter/Dart) — substring match is fine here.
            const pubs = await Promise.all(
                PUB_PATHS.map((p) => fetchManifest(repo.full_name, p))
            );
            const pubText = pubs.filter(Boolean).join("\n").toLowerCase();

            for (const { name, match } of DB_PACKAGE_MAP) {
                const hit = match.some(
                    (m) => depKeys.has(m.toLowerCase()) || pubText.includes(m.toLowerCase())
                );
                if (hit) found.add(name);
            }
            for (const name of found) counts[name] = (counts[name] || 0) + 1;
        })
    );

    const entries = Object.entries(counts);
    if (!entries.length) return [];
    const maxCount = Math.max(...entries.map(([, c]) => c));
    return entries
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([title, count]) => ({
            title,
            percentage: Math.max(65, Math.round(Math.sqrt(count / maxCount) * 100)),
            category: "database",
        }));
};

const buildData = async () => {
    // 1) List repositories. With a token we read the authenticated user's OWN
    //    repos (incl. PRIVATE); without one, only public repos for USERNAME.
    const reposUrl = TOKEN
        ? "https://api.github.com/user/repos?per_page=100&visibility=all&affiliation=owner&sort=updated"
        : `https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`;
    const reposRes = await fetch(reposUrl, { headers: ghHeaders() });
    if (!reposRes.ok) throw new Error(`GitHub repos request failed (${reposRes.status})`);
    const repos = await reposRes.json();

    // Skip forks — they would count other people's code as our skills.
    const sources = Array.isArray(repos) ? repos.filter((r) => !r.fork) : [];

    // 2) Sum the bytes-per-language across every repository.
    const totals = {};
    await Promise.all(
        sources.map(async (repo) => {
            try {
                const res = await fetch(repo.languages_url, { headers: ghHeaders() });
                if (!res.ok) return;
                const langs = await res.json();
                for (const [lang, bytes] of Object.entries(langs)) {
                    if (EXCLUDE.has(lang)) continue;
                    totals[lang] = (totals[lang] || 0) + bytes;
                }
            } catch {
                /* ignore a single repo that fails */
            }
        })
    );

    const entries = Object.entries(totals);
    let skills = [];
    if (entries.length) {
        const grandTotal = entries.reduce((s, [, b]) => s + b, 0);
        const maxBytes = Math.max(...entries.map(([, b]) => b));
        // most-used language = 100%; sqrt curve lifts smaller ones; drop < 1%.
        skills = entries
            .filter(([, b]) => b / grandTotal >= 0.01)
            .sort((a, b) => b[1] - a[1])
            .slice(0, MAX_SKILLS)
            .map(([title, bytes]) => ({
                title,
                percentage: Math.max(5, Math.round(Math.sqrt(bytes / maxBytes) * 100)),
                category: "technical",
            }));
    }

    // 3) Databases — only with a token (needs many extra Contents API calls).
    let databases = [];
    if (TOKEN) {
        try {
            databases = await detectDatabases(sources);
        } catch {
            databases = [];
        }
    }

    return { skills, databases };
};

// GET /github-skills  (public)
const getGithubSkills = async (req, res) => {
    const now = Date.now();
    const hasData = cache.data.skills.length || cache.data.databases.length;

    // Serve a fresh-enough cache without calling GitHub again.
    if (hasData && now - cache.at < TTL_MS) {
        return res.status(200).json({ ...cache.data, cached: true });
    }

    // Environments without global fetch (Node < 18): return whatever we have.
    if (typeof fetch !== "function") {
        return res.status(200).json({ ...cache.data, unsupported: true });
    }

    try {
        const data = await buildData();
        if (data.skills.length || data.databases.length) cache = { at: now, data };
        return res.status(200).json({ ...data, cached: false });
    } catch (err) {
        console.log("github-skills error:", err.message);
        // Fall back to the last good cache (even if stale).
        return res.status(200).json({ ...cache.data, error: true });
    }
};

module.exports = { getGithubSkills };
