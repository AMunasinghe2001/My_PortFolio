import React from "react";
import "./MarkdownRenderer.css";

function formatInline(text) {
  if (!text) return "";
  const tokens = [];
  let remaining = text;
  let keyIndex = 0;

  const regex = /(!?\[([^\]]*)\]\(([^)]+)\))|(`([^`]+)`)|(\*\*([^*]+)\*\*|__([^_]+)__)|(\*([^*]+)\*|_([^_]+)_)/;

  while (remaining) {
    const match = regex.exec(remaining);
    if (!match) {
      tokens.push(remaining);
      break;
    }

    const matchIndex = match.index;
    if (matchIndex > 0) {
      tokens.push(remaining.substring(0, matchIndex));
    }

    const fullMatch = match[0];

    if (fullMatch.startsWith("![")) {
      const alt = match[2];
      const src = match[3];
      tokens.push(
        <img
          key={keyIndex++}
          src={src}
          alt={alt || "Image"}
          loading="lazy"
          className="mr-inline-img"
        />
      );
    } else if (fullMatch.startsWith("[")) {
      const linkText = match[2];
      const href = match[3];
      tokens.push(
        <a
          key={keyIndex++}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {linkText}
        </a>
      );
    } else if (match[4]) {
      tokens.push(<code key={keyIndex++}>{match[5]}</code>);
    } else if (match[6]) {
      tokens.push(<strong key={keyIndex++}>{match[7] || match[8]}</strong>);
    } else if (match[9]) {
      tokens.push(<em key={keyIndex++}>{match[10] || match[11]}</em>);
    } else {
      tokens.push(fullMatch);
    }

    remaining = remaining.substring(matchIndex + fullMatch.length);
  }

  return tokens;
}

export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  const cleaned = content
    .replace(/<div[^>]*>/gi, "")
    .replace(/<\/div>/gi, "")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/p>/gi, "");

  const lines = cleaned.split("\n");
  const elements = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let inList = false;
  let listItems = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`}>
          {listItems.map((item, idx) => (
            <li key={idx}>{formatInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (line.startsWith("```")) {
      flushList();
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBuffer = [];
      } else {
        inCodeBlock = false;
        elements.push(
          <pre key={`code-${elements.length}`}>
            <code>{codeBuffer.join("\n")}</code>
          </pre>
        );
        codeBuffer = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    const listMatch = line.match(/^[-*+]\s+(.+)$/);
    if (listMatch) {
      inList = true;
      listItems.push(listMatch[1]);
      continue;
    } else {
      flushList();
    }

    if (!line) continue;

    if (line.startsWith("#### ")) {
      elements.push(<h4 key={`h4-${elements.length}`}>{formatInline(line.slice(5))}</h4>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={`h3-${elements.length}`}>{formatInline(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={`h2-${elements.length}`}>{formatInline(line.slice(3))}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={`h1-${elements.length}`}>{formatInline(line.slice(2))}</h1>);
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={`bq-${elements.length}`}>
          <p>{formatInline(line.slice(2))}</p>
        </blockquote>
      );
    } else if (/^[-*_]{3,}$/.test(line)) {
      elements.push(<hr key={`hr-${elements.length}`} />);
    } else {
      elements.push(<p key={`p-${elements.length}`}>{formatInline(rawLine)}</p>);
    }
  }

  flushList();
  return <div className="mr-container">{elements}</div>;
}
