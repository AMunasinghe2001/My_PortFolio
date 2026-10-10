import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "./MarkdownRenderer.css";

const API_BASE =
  process.env.REACT_APP_API_URL || "https://my-port-folio-livid.vercel.app";

const isAbsoluteUrl = (src) =>
  /^(https?:)?\/\//i.test(src) || src.startsWith("data:") || src.startsWith("#");

function resolveImage(src, repoFullName, branch) {
  if (!src) return src;
  if (src.startsWith("data:")) return src;
  if (!repoFullName) return src;

  // GitHub-hosted images (raw / user-content / assets) → proxy them too so
  // private-repo asset URLs still render.
  const isGithubAsset =
    /^https?:\/\/(raw\.githubusercontent\.com|github\.com\/.+\/raw\/|user-images\.githubusercontent\.com|private-user-images\.githubusercontent\.com)/i.test(
      src
    );

  let repo = repoFullName;
  let ref = branch;
  let path = src;

  if (isGithubAsset) {
    // Extract repo/ref/path from a GitHub raw URL when possible, else pass-through
    const rawMatch = src.match(
      /^https?:\/\/raw\.githubusercontent\.com\/([^/]+\/[^/]+)\/([^/]+)\/(.+)$/i
    );
    if (rawMatch) {
      repo = rawMatch[1];
      ref = rawMatch[2];
      path = rawMatch[3];
    } else {
      // Non-raw GitHub asset — just forward via proxy using current repo/branch would be wrong,
      // so return the original URL (public user-images are already accessible).
      return src;
    }
  } else if (isAbsoluteUrl(src)) {
    return src;
  } else {
    path = src.replace(/^\.?\//, "");
  }

  const u = new URL(`${API_BASE}/github-projects/image`);
  u.searchParams.set("repo", repo);
  u.searchParams.set("path", path);
  if (ref) u.searchParams.set("ref", ref);
  return u.toString();
}

function resolveLink(href, repoFullName, branch) {
  if (!href || isAbsoluteUrl(href) || !repoFullName) return href;
  return `https://github.com/${repoFullName}/blob/${branch}/${href.replace(/^\.?\//, "")}`;
}

export default function MarkdownRenderer({ content, repoFullName, branch = "main" }) {
  const components = useMemo(
    () => ({
      a: ({ node, children, href, ...props }) => (
        <a
          {...props}
          href={resolveLink(href, repoFullName, branch)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      ),
      img: ({ node, src, ...props }) => (
        <img
          {...props}
          src={resolveImage(src, repoFullName, branch)}
          loading="lazy"
          className="mr-inline-img"
          alt={props.alt || ""}
        />
      ),
      table: ({ node, ...props }) => (
        <div className="mr-table-wrapper">
          <table {...props} />
        </div>
      ),
    }),
    [repoFullName, branch]
  );

  if (!content) return null;

  return (
    <div className="mr-container">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
