"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "./api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState("");
  // localStorage isn't available during SSR, so the first client render must
  // match the server's (logged-out) markup. `ready` flips after hydration,
  // once the real token has been read — guards against hydration mismatch and
  // against ProtectedRoute redirecting before the token is known.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    setUsername(localStorage.getItem("username") || "");
    setReady(true);
  }, []);

  const login = useCallback(async (u, p) => {
    const res = await api.post("/auth/login", { username: u, password: p });
    const { token: newToken, username: name } = res.data;
    localStorage.setItem("token", newToken);
    localStorage.setItem("username", name);
    setToken(newToken);
    setUsername(name);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUsername("");
  }, []);

  // Apply a freshly-issued token/username (e.g. after changing credentials).
  const refreshAuth = useCallback((newToken, name) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
      setToken(newToken);
    }
    if (name) {
      localStorage.setItem("username", name);
      setUsername(name);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, username, ready, isAuthenticated: !!token, login, logout, refreshAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
