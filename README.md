# Smart Portfolio Builder

A profession-aware portfolio builder SaaS frontend that helps users create and publish professional portfolio websites using a customizable dashboard, theme presets, animation presets, and multilingual support.

## 🚀 Overview

**Smart Portfolio Builder** is a multi-user portfolio platform (frontend MVP) designed for all professions — not only developers.

Users can:
- Build a portfolio from a dashboard/admin panel
- Customize appearance (theme, colors, typography, animations)
- Choose profession-based presets (Developer, Doctor, Lawyer, Designer, etc.)
- Preview their portfolio before publishing
- Publish a public portfolio page at a route like `/u/:slug`
- Switch UI language (English / Arabic) with RTL support

> This repository currently contains the **frontend app only** (React + Vite + TypeScript).  
> Backend integration (Express + Prisma + PostgreSQL) will be added in future sprints.

---

## ✨ Key Features (Frontend)

### Dashboard / Admin Panel
- Authentication UI (mock auth flow)
- Protected dashboard routes
- Profile settings
- Projects management (CRUD UI)
- Experience management (CRUD UI)
- Skills management (CRUD UI)
- Services, Testimonials, Gallery, Certifications (UI modules)
- Preview / Publish pages

### Appearance & Branding
- Theme mode (Dark / Light)
- Color palette presets
- Typography presets
- Animation presets
- Profession-based presets (Developer / Doctor / Lawyer / etc.)
- Section visibility and ordering

### Public Portfolio
- Public portfolio route: `/u/:slug`
- Dynamic section rendering
- Responsive layout
- Theme and section settings applied from dashboard state

### Localization
- English / Arabic UI support
- RTL / LTR layout switching

---

## 🛠 Tech Stack

- **React**
- **Vite**
- **TypeScript**
- **React Router**
- **Tailwind CSS**
- **(Generated base + custom refactors)**

> Additional tools/libs may be added/refactored during development sprints (e.g. i18n, state persistence, backend integration).

---

## 📦 Getting Started

### (1) Install dependencies
```bash
npm install
```

### Authentication setup (Backend)

Email/password sign-in works out of the box. Configure the rest in `Backend/.env` (see `Backend/.env.example` for every variable):

- **URLs** — `FRONTEND_URL` (where the SPA runs) and `API_PUBLIC_URL` (this API's public URL).
- **Google** — create an OAuth client ID (type *Web application*) in Google Cloud Console and set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`. Authorized redirect URI: `${API_PUBLIC_URL}/auth/oauth/google/callback` (locally `http://localhost:4000/auth/oauth/google/callback`).
- **GitHub** — create an OAuth App and set `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`. Authorization callback URL: `${API_PUBLIC_URL}/auth/oauth/github/callback` (locally `http://localhost:4000/auth/oauth/github/callback`).
- A provider stays disabled until both of its values are set; its button then explains that sign-in with it isn't available.
- **Password-reset email** — set the `SMTP_*` variables for real delivery. In development with no `SMTP_HOST`, reset emails (with the link) are printed to the API console instead. Production requires SMTP.

First-time Google/GitHub sign-ins land on a confirmation screen; no account is created until the user confirms. If the provider's *verified* email already belongs to an account, the screen instead offers to link that provider to the existing account (never automatically, never for unverified emails), so one user can sign in with password, Google and GitHub.

Run the backend auth unit tests with `npm test` (in `Backend/`).
