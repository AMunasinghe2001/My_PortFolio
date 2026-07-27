import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100svh",
        display: "grid",
        placeItems: "center",
        padding: "40px 22px",
        textAlign: "center",
      }}
    >
      <div className="glass" style={{ padding: "48px 40px", maxWidth: 480 }}>
        <h1
          style={{
            fontSize: "3.4rem",
            marginBottom: 10,
            background: "linear-gradient(120deg, var(--teal-400), var(--aqua))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          404
        </h1>
        <p style={{ color: "var(--text-dim)", marginBottom: 28 }}>
          That page doesn&apos;t exist.
        </p>
        <Link href="/" className="btn btn-primary">
          Back to portfolio
        </Link>
      </div>
    </main>
  );
}
