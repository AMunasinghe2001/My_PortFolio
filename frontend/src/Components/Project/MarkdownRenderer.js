import React, { useMemo, useRef, useEffect } from "react";
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

  const isGithubAsset =
    /^https?:\/\/(raw\.githubusercontent\.com|github\.com\/.+\/raw\/|user-images\.githubusercontent\.com|private-user-images\.githubusercontent\.com)/i.test(
      src
    );

  let repo = repoFullName;
  let ref = branch;
  let path = src;

  if (isGithubAsset) {
    const rawMatch = src.match(
      /^https?:\/\/raw\.githubusercontent\.com\/([^/]+\/[^/]+)\/([^/]+)\/(.+)$/i
    );
    if (rawMatch) {
      repo = rawMatch[1];
      ref = rawMatch[2];
      path = rawMatch[3];
    } else {
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
            className="mr-inline-img"
            alt={props.alt || ""}
          />
        );
      },
      table: ({ node, ...props }) => (
        <div className="mr-table-wrapper">
          <table {...props} />
        </div>
      ),
    }),
    [repoFullName, branch]
  );

  // After render, promote <p>/<div> wrapping a single <img> or anchored <img> to
  // a centered block when the paragraph itself is centered OR when it is the
  // first image at the top of the README (common logo pattern).
  useEffect(() => {
    if (!rootRef.current) return;
    const root = rootRef.current;

    // 1. Any paragraph whose inline style contains text-align:center → its lone
    //    image becomes a block-level centered image.
    const centered = root.querySelectorAll(
      'p[style*="text-align"], div[style*="text-align"], p[align], div[align]'
    );
    centered.forEach((el) => {
      el.classList.add("mr-center-wrap");
    });

    // 2. Heuristic: if the very first child paragraph contains only an image
    //    (and maybe a link wrapping it), treat it as a logo and center it.
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
      if (onlyImage) {
        firstMeaningful.classList.add("mr-center-wrap");
      }
    }
  }, [content, repoFullName, branch]);

  if (!content) return null;

  return (
    <div className="mr-container" ref={rootRef}>
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
