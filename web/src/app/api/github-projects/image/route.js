// Next.js Route Handler that proxies images (and other binary assets) from a
// GitHub repository, including private ones (via GITHUB_TOKEN).

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

const ghHeaders = (accept = "application/vnd.github+json") => {
  const headers = {
    Accept: accept,
    "User-Agent": "portfolio-web-image-proxy",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = getGitHubToken();
  if (token) {
    const cleanToken = token.replace(/^(Bearer|token)\s+/i, "").trim();
    headers.Authorization = `Bearer ${cleanToken}`;
  }
  return headers;
};

function guessContentType(path) {
  const ext = (path.split(".").pop() || "").toLowerCase();
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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawRepo = searchParams.get("repo");
  const rawPath = searchParams.get("path");
  const ref = (searchParams.get("ref") || "").trim();

  if (!rawRepo || !rawPath) {
    return Response.json(
      { message: "repo and path parameters are required" },
      { status: 400 }
    );
  }

  const username = getGitHubUsername();
  const fullName = rawRepo.includes("/") ? rawRepo : `${username}/${rawRepo}`;
  const cleanPath = rawPath.replace(/^\.?\/+/, "");

  try {
    const url = `https://api.github.com/repos/${fullName}/contents/${encodeURI(cleanPath)}${
      ref ? `?ref=${encodeURIComponent(ref)}` : ""
    }`;
    const metaRes = await fetch(url, {
      headers: ghHeaders("application/vnd.github+json"),
      next: { revalidate: 3600 },
    });

    if (!metaRes.ok) {
      return Response.json(
        { message: `GitHub contents fetch failed (${metaRes.status})` },
        { status: metaRes.status }
      );
    }

    const meta = await metaRes.json();

    if (meta.download_url) {
      const binRes = await fetch(meta.download_url, { headers: ghHeaders() });
      if (!binRes.ok) {
        return Response.json(
          { message: "Asset download failed" },
          { status: binRes.status }
        );
      }
      const contentType =
        binRes.headers.get("content-type") || guessContentType(cleanPath);
      const buffer = await binRes.arrayBuffer();
      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    if (meta.content && meta.encoding === "base64") {
      const buffer = Buffer.from(meta.content, "base64");
      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Type": guessContentType(cleanPath),
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    return Response.json({ message: "Asset not found" }, { status: 404 });
  } catch (err) {
    return Response.json(
      { message: "Failed to retrieve asset", error: err.message },
      { status: 500 }
    );
  }
}
