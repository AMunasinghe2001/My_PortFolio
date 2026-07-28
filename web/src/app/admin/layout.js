import AdminGuard from "@/components/admin/AdminGuard";

// Server component so it can carry metadata; the auth guard itself is a client
// component (see AdminGuard). The dashboard is private, so it must never be
// indexed — robots.js disallows it too, this is the belt-and-braces signal.
export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <AdminGuard>{children}</AdminGuard>;
}
