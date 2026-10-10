"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import styles from "./MarkdownRenderer.module.css";

const isAbsoluteUrl = (src) =>
  /^(https?:)?\/\//i.test(src) || src.startsWith("data:") || src.startsWith("#");

function resolveImage(src, repoFullName, branch) {
  if (!src) return src;
  if (src.startsWith("data:")) return src;
  if (!repoFullName) return src;

  let repo = repoFullName;
  let ref = branch;
  let path = src;

  const rawMatch = src.match(
    /^https?:\/\/raw\.githubusercontent\.com\/([^/]+\/[^/]+)\/([^/]+)\/(.+)$/i
  );
  if (rawMatch) {
    repo = rawMatch[1];
    ref = rawMatch[2];
    path = rawMatch[3];
  } else if (isAbsoluteUrl(src)) {
    return src;
  } else {
    path = src.replace(/^\.?\//, "");
  }

  const qs = new URLSearchParams({ repo, path });
  if (ref) qs.set("ref", ref);
  return `/api/github-projects/image?${qs.toString()}`;
}

function resolveLink(href, repoFullName, branch) {
  if (!href || isAbsoluteUrl(href) || !repoFullName) return href;
  return `https://github.com/${repoFullName}/blob/${branch}/${href.replace(/^\.?\//, "")}`;
}

// Convert legacy HTML `align` attribute → inline `text-align` style so
// GitHub-style `<p align="center">` / `<div align="center">` actually center.
function rehypeAlignToStyle() {
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    if (node.type === "element" && node.properties && node.properties.align) {
      const align = String(node.properties.align).toLowerCase();
      if (["left", "center", "right", "justify"].includes(align)) {
        const existing = node.properties.style ? `${node.properties.style};` : "";
        node.properties.style = `${existing}text-align:${align}`;
        delete node.properties.align;
      }
    }
    if (Array.isArray(node.children)) {
      node.children.forEach(walk);
    }
  };
  return (tree) => walk(tree);
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
          className={styles.inlineImg}
          alt={props.alt || ""}
        />
      ),
      table: ({ node, ...props }) => (
        <div className={styles.tableWrapper}>
          <table {...props} className={styles.table} />
        </div>
      ),
    }),
    [repoFullName, branch]
  );

  if (!content) return null;

  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeAlignToStyle]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
