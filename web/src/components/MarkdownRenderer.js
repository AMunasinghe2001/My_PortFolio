"use client";

import React from "react";
import styles from "./MarkdownRenderer.module.css";

// Formats inline markdown elements: links, bold, italic, code
function formatInline(text) {
  if (!text) return "";

  // Split by inline markdown tokens: `code`, **bold**, *italic*, [link](url)
  const tokens = [];
  let remaining = text;
  let keyIndex = 0;

  // Regex to match inline tokens:
  // 1: `code`
  // 2: **bold** or __bold__
  // 3: *italic* or _italic_
  // 4: [text](url)
  // 5: ![alt](url)
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

    // Image ![alt](url)
    if (fullMatch.startsWith("![")) {
      const alt = match[2];
      const src = match[3];
      tokens.push(
        <img
          key={keyIndex++}
          src={src}
          alt={alt || "Image"}
          loading="lazy"
          className={styles.inlineImg}
        />
      );
    }
    // Link [text](url)
    else if (fullMatch.startsWith("[")) {
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
    }
    // Inline code `code`
    else if (match[4]) {
      tokens.push(<code key={keyIndex++}>{match[5]}</code>);
    }
    // Bold **text**
    else if (match[6]) {
      tokens.push(<strong key={keyIndex++}>{match[7] || match[8]}</strong>);
    }
    // Italic *text*
    else if (match[9]) {
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

  // Pre-process: Clean any raw <div ...> or </div> tags from GitHub READMEs
  const cleaned = content
    .replace(/<div[^>]*>/gi, "")
    .replace(/<\/div>/gi, "")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/p>/gi, "");

  const lines = cleaned.split("\n");
  const elements = [];
  let inCodeBlock = false;
  let codeLanguage = "";
  let codeBuffer = [];
  let inList = false;
  let listItems = [];
  let inTable = false;
  let tableRows = [];

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

  const flushTable = () => {
    if (inTable && tableRows.length > 0) {
      const headers = tableRows[0];
      const rows = tableRows.slice(1).filter((r) => !r.every((c) => /^-+$/.test(c.trim())));
      elements.push(
        <div key={`table-wrapper-${elements.length}`} style={{ overflowX: "auto" }}>
          <table className={styles.table}>
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i}>{formatInline(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx}>{formatInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // 1. Fenced Code Block ```
    if (line.startsWith("```")) {
      flushList();
      flushTable();
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
        codeBuffer = [];
      } else {
        inCodeBlock = false;
        elements.push(
          <pre key={`code-${elements.length}`} data-lang={codeLanguage}>
            <code>{codeBuffer.join("\n")}</code>
          </pre>
        );
        codeBuffer = [];
        codeLanguage = "";
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // 2. Table row (starts and contains |)
    if (line.startsWith("|") && line.endsWith("|")) {
      flushList();
      inTable = true;
      const cells = line
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      // Skip separator row like |---|---|
      if (!cells.every((c) => /^[-:]+$/.test(c))) {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    // 3. Bullet list item
    const listMatch = line.match(/^[-*+]\s+(.+)$/);
    if (listMatch) {
      flushTable();
      inList = true;
      listItems.push(listMatch[1]);
      continue;
    } else {
      flushList();
    }

    // Empty lines
    if (!line) {
      continue;
    }

    // 4. Headings
    if (line.startsWith("#### ")) {
      elements.push(<h4 key={`h4-${elements.length}`}>{formatInline(line.slice(5))}</h4>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={`h3-${elements.length}`}>{formatInline(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={`h2-${elements.length}`}>{formatInline(line.slice(3))}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={`h1-${elements.length}`}>{formatInline(line.slice(2))}</h1>);
    }
    // 5. Blockquote
    else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={`bq-${elements.length}`}>
          <p>{formatInline(line.slice(2))}</p>
        </blockquote>
      );
    }
    // 6. Horizontal rule
    else if (/^[-*_]{3,}$/.test(line)) {
      elements.push(<hr key={`hr-${elements.length}`} />);
    }
    // 7. Regular paragraph
    else {
      elements.push(<p key={`p-${elements.length}`}>{formatInline(rawLine)}</p>);
    }
  }

  flushList();
  flushTable();

  return <div className={styles.markdown}>{elements}</div>;
}
