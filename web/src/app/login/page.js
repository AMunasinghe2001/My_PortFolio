"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaEye, FaEyeSlash, FaSignInAlt, FaArrowLeft } from "react-icons/fa";
import { useAuth } from "@/lib/AuthContext";
import styles from "./login.module.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      await login(username, password);
      router.push("/admin");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <h1 className="section-title">
          <span className="t-light">Admin</span>
          <span className="t-accent">Login</span>
        </h1>

        <div className={`glass ${styles.card}`}>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className={styles.passwordWrap}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className={styles.eye}
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary ${styles.submit}`}
              disabled={loading}
            >
              {loading ? "Logging in…" : "Login"} <FaSignInAlt />
            </button>

            {message && (
              <p className={styles.error} role="alert">
                {message}
              </p>
            )}
          </form>

          <Link href="/" className={styles.back}>
            <FaArrowLeft /> Back to site
          </Link>
        </div>
      </div>
    </main>
  );
}
