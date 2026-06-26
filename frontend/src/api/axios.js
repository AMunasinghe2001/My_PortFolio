import axios from "axios";

// Base URL of the backend API. Set REACT_APP_API_URL in .env (local) or in
// Vercel (production). Falls back to the deployed backend.
const baseURL =
    process.env.REACT_APP_API_URL || "https://my-port-folio-livid.vercel.app";

const api = axios.create({ baseURL });

// Attach the JWT (if present) to every request.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// On 401 (expired/invalid token), clear it and bounce out of the admin area.
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response && err.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            if (window.location.pathname.startsWith("/admin")) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(err);
    }
);

export default api;
