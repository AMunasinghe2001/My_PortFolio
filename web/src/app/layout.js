import { Outfit } from "next/font/google";
import { AuthProvider } from "@/lib/AuthContext";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Anushanga Munasinghe — Full-Stack Developer & UI/UX Designer",
    template: "%s | Anushanga Munasinghe",
  },
  description:
    "Anushanga Munasinghe — Full-stack developer, UI/UX designer and mobile app developer. Portfolio, projects and skills.",
  keywords: [
    "Anushanga Munasinghe",
    "full-stack developer",
    "UI/UX designer",
    "MERN stack",
    "React developer",
    "Sri Lanka developer",
  ],
  authors: [{ name: "Anushanga Munasinghe" }],
  creator: "Anushanga Munasinghe",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Anushanga Munasinghe Portfolio",
    title: "Anushanga Munasinghe — Full-Stack Developer & UI/UX Designer",
    description:
      "Full-stack developer, UI/UX designer and mobile app developer. Browse my projects, skills and services.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anushanga Munasinghe — Full-Stack Developer & UI/UX Designer",
    description:
      "Full-stack developer, UI/UX designer and mobile app developer.",
  },
  verification: {
    google: "L4cPCsvIWxZWUMpPd6snkYnGWsWZ8cZIJjYDrqjPqSY",
  },
  // Tells Google which URL is authoritative, so the preview/branch deploys of
  // this same content don't compete with the live site in search results.
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport = {
  themeColor: "#021c1e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={outfit.variable}>
      {/* Extensions such as Grammarly inject attributes into <body> before
          React hydrates, which otherwise logs a hydration mismatch in dev.
          This suppresses that one-level-deep attribute diff only. */}
      <body suppressHydrationWarning>
        {/* Ambient colour field the glass panels refract. Fixed, behind all. */}
        <div className="ambient" aria-hidden="true">
          <span className="orb orb-1" />
          <span className="orb orb-2" />
          <span className="orb orb-3" />
        </div>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
