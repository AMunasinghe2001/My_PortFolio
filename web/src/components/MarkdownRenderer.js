"use client";

import React, { useMemo, useRef, useEffect } from "react";
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
  const rootRef = useRef(null);

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
      img: ({ node, src, ...props }) => {
        const customStyle = {};
        if (props.width) {
          const w = isNaN(props.width) ? props.width : `${props.width}px`;
          customStyle.width = w;
          customStyle.maxWidth = w;
        }
        if (props.height && !isNaN(props.height)) {
          customStyle.height = `${props.height}px`;
        }
        return (
          <img
            {...props}
            src={resolveImage(src, repoFullName, branch)}
            loading="lazy"
            style={{ ...customStyle, ...(props.style || {}) }}
            className={styles.inlineImg}
            alt={props.alt || ""}
          />
        );
      },
      table: ({ node, ...props }) => (
        <div className={styles.tableWrapper}>
          <table {...props} className={styles.table} />
        </div>
      ),
    }),
    [repoFullName, branch]
  );

  useEffect(() => {
    if (!rootRef.current) return;
    const root = rootRef.current;

    const centered = root.querySelectorAll(
      'p[style*="text-align"], div[style*="text-align"], p[align], div[align]'
    );
    centered.forEach((el) => el.classList.add(styles.centerWrap));

    const firstMeaningful = Array.from(root.children).find(
      (c) => c.tagName === "P" || c.tagName === "DIV"
    );
    if (firstMeaningful) {
      const kids = Array.from(firstMeaningful.childNodes).filter(
        (n) => !(n.nodeType === 3 && !n.textContent.trim())
      );
      const onlyImage =
        kids.length === 1 &&
        (kids[0].tagName === "IMG" ||
          (kids[0].tagName === "A" &&
            kids[0].children.length === 1 &&
            kids[0].children[0].tagName === "IMG"));
      if (onlyImage) firstMeaningful.classList.add(styles.centerWrap);
    }
  }, [content, repoFullName, branch]);

  if (!content) return null;

  return (
    <div className={styles.markdown} ref={rootRef}>
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
