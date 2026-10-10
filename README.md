<div align="center">

# 🌟 Anushanga Munasinghe — Full-Stack Portfolio & Headless CMS

**A high-performance, data-driven developer portfolio powered by Next.js, Express.js, MongoDB, and Real-Time GitHub Intelligence.**

[![Next.js](https://img.shields.io/badge/Next.js-15.1.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=for-the-badge&logo=cloudinary)](https://cloudinary.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://anushanga-munasinghe.vercel.app/)

<br />

[🌐 Live Production Website](https://anushanga-munasinghe.vercel.app/) • [📖 Deployment & Setup Guide](SETUP.md) • [💼 LinkedIn](https://www.linkedin.com/in/anushanga-munasinghe-9b51882a2/)

</div>

---

## 📌 Executive Overview

This portfolio is an enterprise-grade personal platform engineered from the ground up to eliminate manual maintenance. Unlike conventional static portfolios with hardcoded lists, this application combines a **Headless CMS** with an automated **GitHub Intelligence Engine**:

1. **Automated Skills & Language Telemetry**: Queries the GitHub REST API byte-for-byte across both public and private repositories using Personal Access Tokens (Bearer Auth), computing exact relative code volume percentages (e.g., Dart, Python, JavaScript, Java, PHP, C++).
2. **Heuristic Database Detection**: Automatically inspects repository dependencies (`package.json`, `pubspec.yaml`, `requirements.txt`), `PLpgSQL` stored procedure languages, and repository topics to dynamically detect databases (PostgreSQL, MongoDB, Supabase, Firebase, MySQL, SQLite, Redis).
3. **Live Repository Project Synchronization**: Any new repository created or updated on GitHub automatically propagates into the **Latest Projects** showcase with auto-generated tech stacks and links.
4. **Interactive In-Modal README.md Viewer**: Clicking on any project card dynamically streams and renders the repository's full `README.md` in markdown format directly inside a frosted glass modal.
5. **Full Administrative Control (CMS)**: A secure JWT-authenticated admin dashboard (`/admin`) allows instant updates to biography, services, journey milestones, and projects with Cloudinary image hosting.
6. **Liquid Glass Design System**: Crafted with a bespoke Vanilla CSS token architecture featuring dark teal canvases, translucent frosted glass panels (`backdrop-filter`), lit rims, and aqua ambient glows.

---

## 🏗️ System Architecture

```
                                 ┌──────────────────────────────────────────────────────────┐
                                 │                    GitHub REST API                       │
                                 │  (/user/repos, /languages, /repos/:owner/:repo/readme)   │
                                 └───────────────▲──────────────────────────▲───────────────┘
                                                 │                          │
                                  Bearer Token   │            Bearer Token  │
                                   Auth Relay    │             Auth Relay   │
                                                 │                          │
┌─────────────────────────────────┐              │          ┌───────────────┴───────────────┐
│     Next.js Web Frontend        │              │          │     Express.js REST API       │
│           (web/)                │              │          │          (Backend/)           │
│                                 │              │          │                               │
│  - App Router (Next.js 15)      ├──────────────┘          │  - Controllers & Routes       │
│  - React 19 Client Components   │                         │  - JWT Middleware (bcryptjs)  │
│  - Route Handlers (/api/*)      │       API Requests      │  - Cloudinary Storage Engine  │
│  - Liquid Glass CSS Modules     │◄───────────────────────►│  - Mongoose ODM               │
│  - Custom Markdown Renderer     │                         └───────────────┬───────────────┘
└─────────────────────────────────┘                                         │
                                                                            │ MongoDB Driver
                                                                            ▼
                                                            ┌───────────────────────────────┐
                                                            │         MongoDB Atlas         │
                                                            │  (Profile, Journey, Projects) │
                                                            └───────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies | Key Responsibilities |
| :--- | :--- | :--- |
| **Frontend Web** | **Next.js 15**, **React 19**, **CSS Modules** | Server-side rendering, Route Handlers, responsive glassmorphism UI, client reveal animations. |
| **Alternative Client** | **React 18 (CRA)**, **React Router 6**, **Axios** | Lightweight Single Page Application fallback client with JWT interceptors. |
| **Backend API** | **Node.js 20**, **Express.js 4** | RESTful routing, authentication middleware, multipart file uploads, rate limiting. |
| **Database & ODM** | **MongoDB Atlas**, **Mongoose 8** | Schemas for Profiles, Projects, Journey/Experience, Skills, and Admin credentials. |
| **External APIs** | **GitHub REST API v3**, **Cloudinary API** | Real-time code telemetry, README extraction, cloud image optimization. |
| **Security & Auth** | **JSON Web Tokens (JWT)**, **bcryptjs**, **Nodemailer** | Stateless authentication, salted password hashing, password reset OTP over Gmail SMTP. |
| **Deployment** | **Vercel** | Serverless Node.js backend execution and Edge frontend hosting with automatic CI/CD. |

---

## ⚡ Key Technical Features

### 1. Real-Time GitHub Telemetry & Skills Engine
* **Byte-Accurate Language Metrics**: Aggregates raw bytes per programming language across all owned repositories. Applies a 0.5% threshold filter to strip tooling noise, then normalizes percentages relative to the primary language:
  $$\text{Percentage} = \text{round}\left(\frac{\text{Bytes}}{\max(\text{Bytes})} \times 100\right)$$
* **Automated Database Recognition**: Analyzes dependency manifests in subdirectories (`package.json`, `pubspec.yaml`, `requirements.txt`), `PLpgSQL` language occurrence, and repository metadata to detect database experience without manual administration.
* **Liquid Glass Shimmer Skeletons**: Employs `@keyframes shimmer` animated SVG/CSS placeholders while data resolves, eliminating Layout Shifts (CLS) and flashing of hardcoded fallback numbers.

### 2. Dynamic Projects & In-Modal Markdown Viewer
* **Zero-Code Project Publishing**: Creating a repository on GitHub automatically injects it into the portfolio's project grid, extracting repository description, primary languages, GitHub link, and live demo URL.
* **On-Demand README Extraction**: When a user selects a project card, the backend relays an authenticated request to `api.github.com/repos/:owner/:repo/readme` with `Accept: application/vnd.github.raw+json`.
* **Private Repository Protection**: Personal Access Tokens (`GITHUB_TOKEN`) are securely mediated server-side; confidential repositories (e.g. *Customs Yard Management System*) stream full documentation to the client without exposing the GitHub token.
* **Custom Markdown Renderer**: Parses headings, fenced code blocks, blockquotes, lists, tables, links, and bold/italic markup directly into styled React components.

### 3. Headless CMS & Admin Control Center (`/admin`)
* **Profile & Hero Manager**: Update hero titles, animated rotating headlines, bio content, social URLs, CV download link, and headshot images.
* **Interactive Timeline (Journey)**: Chronological management of education and professional experience.
* **Service Offerings**: Configurable service cards with custom icons and descriptions.
* **Manual Skill Overrides**: Manage tools (Git, VS Code, Figma, Postman) and professional competencies independently from GitHub code stats.
* **Cloudinary Media Pipeline**: Uses Multer with `multer-storage-cloudinary` to transform and store uploaded images on Cloudinary CDN.

---

## 📂 Repository Structure

```
My_PortFolio/
├── Backend/                            # Express.js REST API
│   ├── config/                         # MongoDB & Cloudinary configuration
│   ├── Controllers/                    # Route controller logic
│   │   ├── authController.js           # JWT login, registration, password reset
│   │   ├── githubProjectsController.js # Dynamic GitHub projects & README fetcher
│   │   ├── githubSkillsController.js   # Automated skills & database analyzer
│   │   ├── profileController.js        # Profile and hero management
│   │   ├── projectController.js        # MongoDB project operations & fallback
│   │   └── ...                         # journey, service, skill controllers
│   ├── Middleware/                     # JWT verification & Multer upload
│   ├── Models/                         # Mongoose data schemas
│   ├── Routers/                        # Express API route declarations
│   ├── scripts/                        # Database seeding scripts (seed.js, seedAdmin.js)
│   ├── App.js                          # Express application entry & CORS
│   └── vercel.json                     # Vercel serverless deployment routing
│
├── web/                                # Next.js 15 Web Application
│   ├── src/
│   │   ├── app/                        # App Router pages & endpoints
│   │   │   ├── api/github-projects/    # Serverless route for projects & README
│   │   │   ├── api/github-skills/      # Serverless route for skills extraction
│   │   │   ├── admin/                  # Protected CMS administration dashboard
│   │   │   ├── login/                  # Admin authentication page
│   │   │   └── page.js                 # Portfolio landing page
│   │   ├── components/                 # Reusable UI components
│   │   │   ├── Hero.js, About.js       # Profile presentation components
│   │   │   ├── Skills.js               # Dynamic skill bars & shimmer skeleton
│   │   │   ├── Projects.js             # Project showcase with README modal
│   │   │   ├── MarkdownRenderer.js     # Custom markdown parsing engine
│   │   │   └── ...                     # Journey, Services, Contact, Nav
│   │   └── lib/                        # Axios instance and scroll reveal hooks
│   └── next.config.mjs                 # Next.js build configuration
│
└── frontend/                           # React 18 SPA (Alternative client)
    └── src/
        ├── api/axios.js                # Axios client with JWT interceptors
        └── Components/                 # React UI sections & Admin panel
```

---

## 📡 REST API Reference

| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/auth/login` | `POST` | Public | Authenticates admin credentials, issues signed JWT token. |
| `/auth/forgot-password` | `POST` | Public | Generates and transmits a 6-digit OTP reset code via Gmail SMTP. |
| `/auth/reset-password` | `POST` | Public | Validates OTP and updates password with salted bcrypt hash. |
| `/profile` | `GET` | Public | Retrieves hero section, about text, social links, and avatar. |
| `/profile` | `PUT` | **Admin** | Updates profile details and uploads new image to Cloudinary. |
| `/projects` | `GET` | Public | Fetches portfolio projects (automatically falls back to GitHub repos if DB is empty). |
| `/github-projects` | `GET` | Public | Real-time GitHub repository listing with languages, stats, and links. |
| `/github-projects/readme` | `GET` | Public | Streams raw Markdown README for a given repository slug (`?repo=owner/name`). |
| `/github-skills` | `GET` | Public | Analyzes language byte volume and detects database dependencies. |
| `/skills` | `GET` | Public | Retrieves manually curated tools and professional competencies. |
| `/journey` | `GET` | Public | Fetches chronological education and career timeline entries. |
| `/services` | `GET` | Public | Retrieves list of software engineering and design services offered. |

---

## ⚙️ Environment Configuration

### Backend (`Backend/.env`)
```ini
# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority

# Security
JWT_SECRET=your_super_long_random_jwt_secret_key
PORT=5000
CLIENT_ORIGIN=https://anushanga-munasinghe.vercel.app

# GitHub Intelligence (Requires 'repo' scope for private repositories)
GITHUB_USERNAME=AMunasinghe2001
GITHUB_TOKEN=ghp_your_github_personal_access_token

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin Seeding Credentials (Used by `npm run seed:admin`)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password

# Password Reset (Gmail SMTP App Password)
SMTP_USER=your_email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
RESET_EMAIL=your_email@gmail.com
```

### Next.js Frontend (`web/.env.local`)
```ini
# Backend API Base URL
NEXT_PUBLIC_API_URL=https://my-port-folio-livid.vercel.app

# GitHub Credentials (For Serverless Route Handlers)
GITHUB_USERNAME=AMunasinghe2001
GITHUB_TOKEN=ghp_your_github_personal_access_token
NEXT_PUBLIC_GITHUB_USERNAME=AMunasinghe2001
NEXT_PUBLIC_GITHUB_TOKEN=ghp_your_github_personal_access_token

# EmailJS Contact Form
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

---

## 🚀 Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/AMunasinghe2001/My_PortFolio.git
cd My_PortFolio
```

### 2. Start the Backend API
```bash
cd Backend
npm install
npm run seed:admin   # Seeds admin login credentials into MongoDB
npm run seed         # Initializes default content into collections
npm run dev          # Starts Express server at http://localhost:5000
```

### 3. Start Next.js Frontend
```bash
cd ../web
npm install
npm run dev          # Starts Next.js server at http://localhost:3000
```

---

## 🔒 Security Architecture

* **Token Isolation**: Secrets such as `MONGO_URI`, `JWT_SECRET`, and `GITHUB_TOKEN` remain strictly in server-side environment variables and are never bundled into client scripts.
* **Sanitized Token Formatting**: The GitHub integration sanitizes tokens against accidental duplicate `Bearer ` or quote characters.
* **Rate-Limit Resilience**: Using authenticated GitHub calls elevates rate limits from 60 to **5,000 requests/hour**, backed by in-memory caching layers with automated stale invalidation.
* **CORS Origin Whitelisting**: Strict origin policy permitting only approved domain origins, localhost development, and verified Vercel preview environments.
* **Cryptographic Hashing**: All passwords stored in MongoDB are hashed using `bcryptjs` with auto-generated salts.

---

## 👨‍💻 Author & Contact

**Anushanga Munasinghe**  
*Full-Stack Developer & Software Engineering Undergraduate*

* 🌐 **Portfolio**: [anushanga-munasinghe.vercel.app](https://anushanga-munasinghe.vercel.app/)
* 💼 **LinkedIn**: [Anushanga Munasinghe](https://www.linkedin.com/in/anushanga-munasinghe-9b51882a2/)
* 🐙 **GitHub**: [@AMunasinghe2001](https://github.com/AMunasinghe2001)

---

<div align="center">
  <sub>Designed & Developed with Passion by Anushanga Munasinghe • © 2026 All Rights Reserved</sub>
</div>
