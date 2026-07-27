"use client";

import styles from "./ui.module.css";

// Small building blocks shared by every admin editor, so the pages stay
// focused on their data instead of repeating layout markup.

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* Inline success/error banner. `msg` is { type: 'success'|'error', text }. */
export function Message({ msg }) {
  if (!msg) return null;
  return (
    <div
      className={`${styles.msg} ${msg.type === "success" ? styles.ok : styles.bad}`}
      role="status"
    >
      {msg.text}
    </div>
  );
}

/* A glass panel used for forms and grouped fields. */
export function Panel({ title, children, as: Tag = "div", ...rest }) {
  return (
    <Tag className={`glass ${styles.panel}`} {...rest}>
      {title && <h2 className={styles.panelTitle}>{title}</h2>}
      {children}
    </Tag>
  );
}

export function SectionLabel({ children }) {
  return <h3 className={styles.sectionLabel}>{children}</h3>;
}

/* An editable row inside a list of records. */
export function Row({ children, className = "", ...rest }) {
  return (
    <div className={`glass ${styles.row} ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function RowActions({ children }) {
  return <div className={styles.rowActions}>{children}</div>;
}

export function Grid2({ children }) {
  return <div className={styles.grid2}>{children}</div>;
}

export function Hint({ children }) {
  return <p className={styles.hint}>{children}</p>;
}

export function Empty({ children }) {
  return <p className={styles.empty}>{children}</p>;
}

export { styles as adminStyles };
