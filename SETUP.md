# Portfolio — Setup & Deployment Guide

මේ project එකේ දැන් **හරියට වැඩ කරන backend (CMS)** එකක් තියෙනවා. Site එකේ හැම section එකකම data (Home, About, Skills, Journey, Services, Projects, social links) MongoDB එකේ. Nav bar එකේ **Login** එකෙන් ලොග් වෙලා `/admin` dashboard එකෙන් ඔක්කොම update කරන්න පුළුවන්. තවදුරටත් code එක hardcode කරන්න ඕන නෑ.

---

## 1. Architecture

```
My_PortFolio/
├── Backend/         Express + MongoDB + Cloudinary + JWT  (deploy: Vercel)
│   ├── Models/      profile, project, skill, journey, service, admin
│   ├── Controllers/ auth, profile, project, skill, journey, service
│   ├── Routers/     /auth /profile /projects /skills /journey /services
│   ├── Middleware/  authMiddleware (JWT), upload (Cloudinary)
│   ├── config/      db, cloudinary
│   ├── scripts/     seed.js, seedAdmin.js
│   └── .env         secrets (NOT committed)
└── frontend/        React (CRA)                            (deploy: Vercel)
    └── src/
        ├── api/axios.js        single API client (adds JWT, baseURL)
        ├── context/AuthContext provides login/logout/token
        └── Components/
            ├── (public sections — fetch from API, hardcoded fallback)
            └── Admin/          dashboard + editors
```

The public site reads everything from the API. If the API is empty/unreachable, each section falls back to its old hardcoded content, so the site never looks broken.

---

## 2. What you need to provide

| Value | Where to get it |
|-------|-----------------|
| **MongoDB URI** | Your existing MongoDB Atlas cluster (already in `.env`). ⚠️ See security note below. |
| **Cloudinary** cloud name / API key / API secret | Free account at https://cloudinary.com → Dashboard |
| **Admin username / password** | You choose. Set in `Backend/.env`. |
| **JWT secret** | Already generated in `Backend/.env`. |

Open `Backend/.env` and fill in the three Cloudinary values (and change `ADMIN_PASSWORD` if you like):

```
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
```

---

## 3. Run locally

### Backend
```bash
cd Backend
npm install
npm run seed:admin      # creates your admin login (reads ADMIN_* from .env)
npm run seed            # migrates the old hardcoded content into MongoDB + uploads images to Cloudinary
npm run dev             # http://localhost:5000
```
> `npm run seed` only fills collections that are empty. To wipe & re-seed: `npm run seed -- --force`.
> Images are uploaded to Cloudinary only if the 3 Cloudinary keys are set. Without them, text is seeded and you can add images later from the dashboard.

### Frontend
```bash
cd frontend
npm install
npm start               # http://localhost:3000  (uses REACT_APP_API_URL from frontend/.env)
```

---

## 4. How to update your portfolio (no code!)

1. Open the site → click **Login** in the nav bar.
2. Enter your admin username + password → you land on **/admin**.
3. Pick a section:
   - **Profile & Hero** — name, animated job titles, intro, about text, social links, resume, hero/about images.
   - **Projects** — add / edit / delete, with image upload.
   - **Skills / Journey / Services** — add / edit / delete rows.
4. Save → changes are live immediately. **Logout** when done.

---

## 5. Deploy to Vercel

### Backend (project: `my-port-folio-livid` or your own)
Set these **Environment Variables** in Vercel → Project → Settings:
```
MONGO_URI, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD,
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET,
CLIENT_ORIGIN = https://anushanga-munasinghe.vercel.app
```
Then redeploy. (Run `npm run seed:admin` / `npm run seed` once locally against the same MONGO_URI — they write to the same database.)

### Frontend (project: `anushanga-munasinghe`)
Set:
```
REACT_APP_API_URL = https://my-port-folio-livid.vercel.app
```
Redeploy.

---

## 6. ⚠️ Security note (please do this)

The old `Backend/App.js` had the MongoDB username/password **committed in the code** (it's in your public git history). Anyone can read it. After everything works:
1. In MongoDB Atlas → Database Access → edit the user → **reset the password**.
2. Update `MONGO_URI` in `Backend/.env` and in Vercel with the new password.

Secrets now live only in `.env` (git-ignored) and Vercel env vars — never in code.

(Also: the file `netlify.toml` in the repo root is actually a saved GitHub HTML page, not a config — safe to delete.)
