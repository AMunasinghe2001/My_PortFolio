require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./Routers/authRoutes");
const profileRoutes = require("./Routers/profileRoutes");
const projectRoutes = require("./Routers/projectRoutes");
const skillRoutes = require("./Routers/skillRoutes");
const githubSkillsRoutes = require("./Routers/githubSkillsRoutes");
const journeyRoutes = require("./Routers/journeyRoutes");
const serviceRoutes = require("./Routers/serviceRoutes");

const app = express();

// ---- CORS ----
const allowedOrigins = [
    "http://localhost:3000",
    "https://anushanga-munasinghe.vercel.app",
    ...(process.env.CLIENT_ORIGIN
        ? process.env.CLIENT_ORIGIN.split(",").map((s) => s.trim())
        : []),
];

// Allow non-browser tools (no origin), any whitelisted origin, and any Vercel
// deployment of the frontend (production + preview URLs end in .vercel.app).
const isAllowedOrigin = (origin) =>
    !origin ||
    allowedOrigins.includes(origin) ||
    /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);

app.use(
    cors({
        origin: (origin, cb) => {
            if (isAllowedOrigin(origin)) return cb(null, true);
            return cb(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    })
);

app.use(express.json());

// ---- Routes ----
app.get("/", (req, res) => res.json({ status: "ok", message: "Portfolio API" }));
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/projects", projectRoutes);
app.use("/skills", skillRoutes);
app.use("/github-skills", githubSkillsRoutes);
app.use("/journey", journeyRoutes);
app.use("/services", serviceRoutes);

// ---- DB + server ----
// Start connecting immediately. Mongoose buffers queries until connected, so
// the server can listen right away — even if the DB is briefly unreachable,
// the process stays up and requests get a clear error instead of silently
// dying. On Vercel (serverless) we must NOT call app.listen.
const PORT = process.env.PORT || 5000;

connectDB().catch((err) =>
    console.log("DB connection error (server still running):", err.message)
);

if (!process.env.VERCEL) {
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

module.exports = app;
