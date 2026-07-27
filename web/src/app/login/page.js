"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaArrowLeft,
  FaPaperPlane,
  FaCheck,
} from "react-icons/fa";
import { useAuth } from "@/lib/AuthContext";
import api from "@/lib/api";
import CursorField from "@/components/CursorField";
import styles from "./login.module.css";

// The reset flow runs in three steps inside the same card.
const STEP = {
  LOGIN: "login",
  REQUEST: "request", // confirm you want a code
  CODE: "code", // enter the emailed code
  RESET: "reset", // choose a new password
};

export default function LoginPage() {
  const [step, setStep] = useState(STEP.LOGIN);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }
  const [loading, setLoading] = useState(false);

  // Reset flow state
  const [code, setCode] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const router = useRouter();
  const { login, refreshAuth } = useAuth();

  const fail = (err, fallback) =>
    setMessage({
      type: "error",
      text: err?.response?.data?.message || fallback,
    });

  const goTo = (next) => {
    setMessage(null);
    setStep(next);
  };

  // ---- Step 0: normal login ----
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      await login(username, password);
      router.push("/admin");
    } catch (err) {
      fail(err, "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // ---- Step 1: send the code ----
  const requestCode = async () => {
    setMessage(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", {});
      setSentTo(res.data.email || "your email");
      setCode("");
      setStep(STEP.CODE);
      setMessage({ type: "success", text: res.data.message });
    } catch (err) {
      fail(err, "Could not send the reset code.");
    } finally {
      setLoading(false);
    }
  };

  // ---- Step 2: verify the code ----
  const verifyCode = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", { code: code.trim() });
      setResetToken(res.data.resetToken);
      setNewPassword("");
      setConfirmPassword("");
      setStep(STEP.RESET);
    } catch (err) {
      fail(err, "Could not verify the code.");
    } finally {
      setLoading(false);
    }
  };

  // ---- Step 3: set the new password ----
  const submitNewPassword = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      return setMessage({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
    }
    if (newPassword !== confirmPassword) {
      return setMessage({ type: "error", text: "The passwords do not match." });
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", {
        resetToken,
        newPassword,
      });
      // The API logs us straight in, so go to the dashboard.
      refreshAuth(res.data.token, res.data.username);
      router.push("/admin");
    } catch (err) {
      fail(err, "Could not reset the password.");
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    [STEP.LOGIN]: ["Admin", "Login"],
    [STEP.REQUEST]: ["Forgot", "Password"],
    [STEP.CODE]: ["Enter", "Code"],
    [STEP.RESET]: ["New", "Password"],
  };
  const [titleA, titleB] = titles[step];

  return (
    <main className={styles.page}>
      <CursorField fadeOnScroll={false} />

      <div className={styles.wrap}>
        <h1 className="section-title">
          <span className="t-light">{titleA}</span>
          <span className="t-accent">{titleB}</span>
        </h1>

        <div className={`glass ${styles.card}`}>
          {/* ---------------- Login ---------------- */}
          {step === STEP.LOGIN && (
            <form onSubmit={handleLogin}>
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

              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => goTo(STEP.REQUEST)}
              >
                Forgot password?
              </button>
            </form>
          )}

          {/* ---------------- Request a code ---------------- */}
          {step === STEP.REQUEST && (
            <>
              <p className={styles.lead}>
                We&apos;ll email a 6-digit code to the address on file for this
                admin account. Enter it on the next screen to choose a new
                password.
              </p>

              <button
                type="button"
                className={`btn btn-primary ${styles.submit}`}
                onClick={requestCode}
                disabled={loading}
              >
                {loading ? "Sending…" : "Send code"} <FaPaperPlane />
              </button>

              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => goTo(STEP.LOGIN)}
              >
                Back to login
              </button>
            </>
          )}

          {/* ---------------- Enter the code ---------------- */}
          {step === STEP.CODE && (
            <form onSubmit={verifyCode}>
              <p className={styles.lead}>
                Enter the 6-digit code sent to <strong>{sentTo}</strong>.
              </p>

              <div className="field">
                <label htmlFor="code">Verification code</label>
                <input
                  id="code"
                  className={styles.otpInput}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  // Digits only, so a pasted "123 456" still works.
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className={`btn btn-primary ${styles.submit}`}
                disabled={loading || code.length !== 6}
              >
                {loading ? "Verifying…" : "Verify code"} <FaCheck />
              </button>

              <div className={styles.linkRow}>
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={requestCode}
                  disabled={loading}
                >
                  Resend code
                </button>
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={() => goTo(STEP.LOGIN)}
                >
                  Back to login
                </button>
              </div>
            </form>
          )}

          {/* ---------------- New password ---------------- */}
          {step === STEP.RESET && (
            <form onSubmit={submitNewPassword}>
              <p className={styles.lead}>
                Code verified. Choose a new password for your admin account.
              </p>

              <div className="field">
                <label htmlFor="newPassword">New password</label>
                <div className={styles.passwordWrap}>
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className={styles.eye}
                    onClick={() => setShowNewPassword((s) => !s)}
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="field">
                <label htmlFor="confirmPassword">Confirm new password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat the new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <button
                type="submit"
                className={`btn btn-primary ${styles.submit}`}
                disabled={loading}
              >
                {loading ? "Saving…" : "Set password & sign in"} <FaCheck />
              </button>
            </form>
          )}

          {message && (
            <p
              className={`${styles.message} ${
                message.type === "success" ? styles.ok : styles.error
              }`}
              role="alert"
            >
              {message.text}
            </p>
          )}

          <Link href="/" className={styles.back}>
            <FaArrowLeft /> Back to site
          </Link>
        </div>
      </div>
    </main>
  );
}
