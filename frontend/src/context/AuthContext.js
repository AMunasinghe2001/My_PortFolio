import React, { createContext, useContext, useState, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [username, setUsername] = useState(
        () => localStorage.getItem("username") || ""
    );

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
            value={{ token, username, isAuthenticated: !!token, login, logout, refreshAuth }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
