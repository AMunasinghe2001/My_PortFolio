// Next.js Route Handler for fetching GitHub skills and databases
// Supports GitHub Personal Access Token (GITHUB_TOKEN / NEXT_PUBLIC_GITHUB_TOKEN)
// to fetch private repositories (e.g. Customs_Yard_Management_System with Dart & PostgreSQL).

const EXCLUDE = new Set([
  "Makefile", "Dockerfile", "Procfile", "Batchfile", "Roff", "Hack", "CMake",
  "PLpgSQL", "TSQL", "PLSQL", "SQLPL", "Jupyter Notebook", "Inno Setup",
]);

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

const ghHeaders = (useAuth = true) => {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-web-route",
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

const detectDatabases = async (repos, rawLangsByRepo = {}, useAuth = true) => {
  const counts = {};

  await Promise.all(
    repos.map(async (repo) => {
      const found = new Set();
      const repoLangs = rawLangsByRepo[repo.full_name] || {};

      if (repoLangs["PLpgSQL"] && repoLangs["PLpgSQL"] > 0) {
        found.add("PostgreSQL");
      }
      if (repoLangs["PLSQL"] || repoLangs["TSQL"]) {
        found.add("SQL Server");
      }

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
          /* ignore */
        }
      }

      const pubs = await Promise.all(
        PUB_PATHS.map((p) => fetchManifest(repo.full_name, p, useAuth))
      );
      const pubText = pubs.filter(Boolean).join("\n").toLowerCase();

      const pyFiles = await Promise.all(
        PY_PATHS.map((p) => fetchManifest(repo.full_name, p, useAuth))
      );
      const pyText = pyFiles.filter(Boolean).join("\n").toLowerCase();

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

export async function GET() {
  try {
    const token = getGitHubToken();
    const username = getGitHubUsername();

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

    let repos = [];
    let authenticated = false;

    for (const { url, authed } of endpoints) {
      try {
        const res = await fetch(url, { headers: ghHeaders(authed), next: { revalidate: 3600 } });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            repos = data;
            authenticated = authed;
            break;
          }
        }
      } catch {
        /* try next endpoint */
      }
    }

    if (!repos.length) {
      return Response.json({ skills: [], databases: [], authenticated: false });
    }

    const sources = repos.filter((r) => !r.fork);
    const totals = {};
    const rawLangsByRepo = {};

    await Promise.all(
      sources.map(async (repo) => {
        try {
          const res = await fetch(repo.languages_url, {
            headers: ghHeaders(true),
            next: { revalidate: 3600 },
          });
          if (!res.ok) return;
          const langs = await res.json();
          rawLangsByRepo[repo.full_name] = langs;

          for (const [lang, bytes] of Object.entries(langs)) {
            if (EXCLUDE.has(lang)) continue;
            totals[lang] = (totals[lang] || 0) + bytes;
          }
        } catch {
          /* ignore */
        }
      })
    );

    const entries = Object.entries(totals);
    let skills = [];
    if (entries.length) {
      const grandTotal = entries.reduce((s, [, b]) => s + b, 0);
      const maxBytes = Math.max(...entries.map(([, b]) => b));

      skills = entries
        .filter(([, b]) => b / grandTotal >= 0.005)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([title, bytes]) => ({
          title,
          percentage: Math.max(1, Math.round((bytes / maxBytes) * 100)),
          category: "technical",
        }));
    }

    const databases = await detectDatabases(sources, rawLangsByRepo, true);

    return Response.json({
      skills,
      databases,
      authenticated,
    });
  } catch (err) {
    return Response.json(
      { error: err.message, skills: [], databases: [], authenticated: false },
      { status: 500 }
    );
  }
}
