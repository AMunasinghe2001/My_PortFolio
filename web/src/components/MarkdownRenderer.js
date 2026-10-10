"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import styles from "./MarkdownRenderer.module.css";

const isAbsoluteUrl = (src) =>
  /^(https?:)?\/\//i.test(src) || src.startsWith("data:") || src.startsWith("#");

function resolveUrl(src, repoFullName, branch) {
  if (!src || isAbsoluteUrl(src)) return src;
  if (!repoFullName) return src;
  const clean = src.replace(/^\.?\//, "");
  return `https://raw.githubusercontent.com/${repoFullName}/${branch}/${clean}`;
}

export default function MarkdownRenderer({ content, repoFullName, branch = "main" }) {
  const components = useMemo(
    () => ({
      a: ({ node, children, href, ...props }) => (
        <a
          {...props}
          href={href && !isAbsoluteUrl(href) && repoFullName
            ? `https://github.com/${repoFullName}/blob/${branch}/${href.replace(/^\.?\//, "")}`
            : href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      ),
      img: ({ node, src, ...props }) => (
        <img
          {...props}
          src={resolveUrl(src, repoFullName, branch)}
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
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
