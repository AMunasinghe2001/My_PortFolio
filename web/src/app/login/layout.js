// The login screen holds no public content, so keep it out of search results.
// This server component exists purely to carry that metadata — the page itself
// is a client component and cannot export it.
export const metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }) {
  return children;
}
