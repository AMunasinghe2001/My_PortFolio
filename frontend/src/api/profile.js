import api from "./axios";

// Caches the profile in localStorage so reloads render the correct data
// instantly (no "old image flashes first, then the new one loads"). Also
// de-duplicates the request so Home/About/Footer share a single /profile call.

const CACHE_KEY = "profileCache";
let inflight = null;

export const getCachedProfile = () => {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const fetchProfile = () => {
    if (!inflight) {
        inflight = api
            .get("/profile")
            .then((res) => {
                const p = res.data && res.data.profile;
                if (p) {
                    try {
                        localStorage.setItem(CACHE_KEY, JSON.stringify(p));
                    } catch {
                        /* storage full / unavailable — ignore */
                    }
                }
                return p;
            })
            .finally(() => {
                inflight = null;
            });
    }
    return inflight;
};
