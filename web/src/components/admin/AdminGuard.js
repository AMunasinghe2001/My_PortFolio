"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import AdminNav from "@/components/admin/AdminNav";
import styles from "@/app/admin/admin.module.css";

// Guards every /admin/* route. The token lives in localStorage, so it can only
// be read after hydration — `ready` prevents a redirect firing on the server
// render (where nobody is ever authenticated).
//
// This lives apart from the route layout so that layout can stay a server
// component and export `metadata` (client components cannot).
export default function AdminGuard({ children }) {
  const { isAuthenticated, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace("/login");
    }
  }, [ready, isAuthenticated, router]);

  if (!ready || !isAuthenticated) {
    return (
      <main className={styles.gate}>
        <span className={styles.spinner} aria-hidden="true" />
        <p>{ready ? "Redirecting to login…" : "Checking your session…"}</p>
      </main>
    );
  }

  return (
    <div className={styles.page}>
      <AdminNav />
      <main className={styles.container}>{children}</main>
    </div>
  );
}
