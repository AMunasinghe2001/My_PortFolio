import React, { useState } from "react";
import api from "../../api/axios";
import AdminNav from "./AdminNav";
import { useAuth } from "../../context/AuthContext";
import "./admin.css";

const AccountEditor = () => {
  const { username, refreshAuth } = useAuth();
  const [form, setForm] = useState({
    currentPassword: "",
    newUsername: username || "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!form.currentPassword) {
      return setMsg({ type: "error", text: "Enter your current password to confirm changes." });
    }
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      return setMsg({ type: "error", text: "New password and confirmation do not match." });
    }
    const usernameChanged = form.newUsername.trim() && form.newUsername.trim() !== username;
    if (!form.newPassword && !usernameChanged) {
      return setMsg({ type: "error", text: "Change the username or set a new password first." });
    }

    setSaving(true);
    try {
      const res = await api.put("/auth/credentials", {
        currentPassword: form.currentPassword,
        newUsername: form.newUsername.trim(),
        newPassword: form.newPassword || undefined,
      });
      refreshAuth(res.data.token, res.data.username);
      setForm((f) => ({
        ...f,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        newUsername: res.data.username,
      }));
      setMsg({ type: "success", text: res.data.message || "Credentials updated successfully." });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Update failed." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <AdminNav />
      <div className="admin-container">
        <h1 className="admin-title">Account</h1>
        <p className="admin-subtitle">Change your admin username and password.</p>
        {msg && <div className={`admin-msg ${msg.type}`}>{msg.text}</div>}

        <form className="admin-form" onSubmit={submit} style={{ maxWidth: 600 }}>
          <h2>Login credentials</h2>

          <div className="admin-field">
            <label>Current password</label>
            <input
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={change}
              autoComplete="current-password"
              required
            />
            <span className="hint">Required to confirm any change.</span>
          </div>

          <div className="admin-field">
            <label>Username</label>
            <input
              type="text"
              name="newUsername"
              value={form.newUsername}
              onChange={change}
              autoComplete="username"
            />
          </div>

          <div className="admin-grid-2">
            <div className="admin-field">
              <label>New password</label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={change}
                autoComplete="new-password"
                placeholder="Leave blank to keep current"
              />
              <span className="hint">At least 6 characters.</span>
            </div>
            <div className="admin-field">
              <label>Confirm new password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={change}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Update credentials"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountEditor;
