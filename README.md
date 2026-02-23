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