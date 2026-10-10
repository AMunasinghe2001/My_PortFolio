export const dynamic = "force-dynamic";
export const revalidate = 0;

// Next.js Route Handler for fetching a repository's README.md content from GitHub API
// Supports private repositories via GITHUB_TOKEN.

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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawRepo = searchParams.get("repo");

  if (!rawRepo) {
    return Response.json({ message: "repo parameter is required" }, { status: 400 });
  }

  const username = getGitHubUsername();
  const token = getGitHubToken();
  const fullName = rawRepo.includes("/") ? rawRepo : `${username}/${rawRepo}`;

  const headers = {
    Accept: "application/vnd.github.raw+json",
    "User-Agent": "portfolio-web-readme",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (token) {
    const cleanToken = token.replace(/^(Bearer|token)\s+/i, "").trim();
    headers.Authorization = `Bearer ${cleanToken}`;
  }

  try {
    const url = `https://api.github.com/repos/${fullName}/readme`;
    const res = await fetch(url, { headers, cache: "no-store" });

    if (!res.ok) {
      if (res.status === 404) {
        return Response.json(
          { message: "README.md not found in repository", content: null },
          { status: 404 }
        );
      }
      return Response.json(
        { message: `GitHub API error: ${res.status}` },
        { status: res.status }
      );
    }

    const content = await res.text();
    return Response.json({ content });
  } catch (err) {
    return Response.json(
      { message: "Failed to fetch README", error: err.message },
      { status: 500 }
    );
  }
}
