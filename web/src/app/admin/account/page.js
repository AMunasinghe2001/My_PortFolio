"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { PageHeader, Message, Panel, Grid2 } from "@/components/admin/ui";

export default function AccountEditorPage() {
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
      return setMsg({
        type: "error",
        text: "Enter your current password to confirm changes.",
      });
    }
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      return setMsg({
        type: "error",
        text: "New password and confirmation do not match.",
      });
    }
    const usernameChanged =
      form.newUsername.trim() && form.newUsername.trim() !== username;
    if (!form.newPassword && !usernameChanged) {
      return setMsg({
        type: "error",
        text: "Change the username or set a new password first.",
      });
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
      setMsg({
        type: "success",
        text: res.data.message || "Credentials updated successfully.",
      });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Update failed." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Account"
        subtitle="Change your admin username and password."
      />
      <Message msg={msg} />

      <form onSubmit={submit} style={{ maxWidth: 640 }}>
        <Panel title="Login credentials">
          <div className="field">
            <label htmlFor="currentPassword">Current password</label>
            <input
              id="currentPassword"
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={change}
              autoComplete="current-password"
              required
            />
            <span className="hint">Required to confirm any change.</span>
          </div>

          <div className="field">
            <label htmlFor="newUsername">Username</label>
            <input
              id="newUsername"
              type="text"
              name="newUsername"
              value={form.newUsername}
              onChange={change}
              autoComplete="username"
            />
          </div>

          <Grid2>
            <div className="field">
              <label htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={change}
                autoComplete="new-password"
                placeholder="Leave blank to keep current"
              />
              <span className="hint">At least 6 characters.</span>
            </div>
            <div className="field">
              <label htmlFor="confirmPassword">Confirm new password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={change}
                autoComplete="new-password"
              />
            </div>
          </Grid2>
        </Panel>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Update credentials"}
        </button>
      </form>
    </>
  );
}
