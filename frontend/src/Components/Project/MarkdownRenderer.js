import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "./MarkdownRenderer.css";

export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  return (
    <div className="mr-container">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
          img: ({ node, ...props }) => (
            <img {...props} loading="lazy" className="mr-inline-img" alt={props.alt || ""} />
          ),
          table: ({ node, ...props }) => (
            <div className="mr-table-wrapper">
              <table {...props} />
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
