import api from "./api";

// Caches the profile in localStorage so reloads render the correct data
// instantly (no "old image flashes first, then the new one loads"). Also
// de-duplicates the request so Home/About/Footer share a single /profile call.

const CACHE_KEY = "profileCache";
let inflight = null;

export const getCachedProfile = () => {
  if (typeof window === "undefined") return null;
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
        const p = res.data?.profile;
        if (p && typeof window !== "undefined") {
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
