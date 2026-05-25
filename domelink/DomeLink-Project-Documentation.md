# DomeLink Project: Complete Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Backend](#backend)
    - [Backend Structure](#backend-structure)
    - [Database & Prisma Schema](#database--prisma-schema)
    - [API Endpoints](#api-endpoints)
    - [Controllers](#controllers)
    - [Middleware](#middleware)
    - [Models](#models)
    - [Routes](#routes)
    - [Services](#services)
    - [Utils](#utils)
4. [Frontend](#frontend)
    - [Frontend Structure](#frontend-structure)
    - [Pages](#pages)
    - [Components](#components)
    - [API Client](#api-client)
    - [Context, Hooks, Lib, Data](#context-hooks-lib-data)
5. [Shared Types](#shared-types)
6. [Development & Build](#development--build)
7. [Onboarding Flow](#onboarding-flow)
8. [Authentication & Authorization](#authentication--authorization)
9. [Socket & Real-Time](#socket--real-time)
10. [Testing](#testing)
11. [Deployment & Docker](#deployment--docker)
12. [Appendix: File/Folder Reference](#appendix-filefolder-reference)

---

## Project Overview
DomeLink is a full-stack web application designed to connect homeowners and architects, providing a seamless onboarding experience, project management, and real-time collaboration. The project is built with a modern TypeScript stack: Node.js/Express/Prisma for the backend, React 18 + Vite for the frontend, and PostgreSQL as the database. The codebase is modular, scalable, and follows best practices for ESM/NodeNext compatibility.

---

## Architecture Overview
- **Monorepo Structure:**
    - `backend/` — Node.js/Express API, Prisma ORM, authentication, business logic
    - `frontend/` — React SPA, Vite, modular pages/components, API client
    - `shared/` — Shared TypeScript types
    - `scripts/` — Utility scripts (e.g., seed data)
- **API:** RESTful, JWT-authenticated, with role-based access control
- **Database:** PostgreSQL, managed via Prisma ORM
- **Real-Time:** Socket.io for chat and notifications
- **Containerization:** Docker/Docker Compose for local and production deployment

---

## Backend
### Backend Structure
- `backend/`
    - `controllers/` — Route handlers for business logic
    - `middleware/` — Express middleware (auth, role, validation, error handling)
    - `models/` — (Legacy) Mongoose models (for reference; main ORM is Prisma)
    - `prisma/` — Prisma schema and migrations
    - `routes/` — Express route definitions
    - `services/` — Business logic/services (e.g., AI integration)
    - `src/` — Main app entrypoints, config, and all core logic
    - `utils/` — Utility functions (e.g., JWT)
    - `Dockerfile`, `docker-compose.yml` — Containerization
    - `package.json`, `tsconfig.json` — Project config

### Database & Prisma Schema
- **Prisma ORM** manages the PostgreSQL schema.
- `User` model includes:
    - Core fields: `id`, `email`, `password`, `name`, `role`, `avatar`
    - Architect fields: `location`, `specialty`, `startingPrice`, `experience`, `teamSize`, `heroImage`, `about`, `slug`
    - Homeowner onboarding fields: `city`, `projectType`, `plotSize`, `budgetMin`, `budgetMax`, `preferredStyles` (JSON), `vastuPreference` (boolean), `timeline`, `familySize`, `projectStage`, `onboardingCompleted`
    - Relations: Consultations, messages
- **Other models:** `Consultation`, `ChatMessage`, etc.

### API Endpoints
- **Auth:** `/api/auth/login`, `/api/auth/register`, `/api/auth/me`, etc.
- **Onboarding:**
    - `POST /api/onboarding/homeowner` — Submit onboarding data (CLIENT only)
    - `GET /api/onboarding/me` — Get current user's onboarding state
- **User Dashboard:** `/api/user/dashboard`
- **AI:** `/api/ai/...` (AI-powered features)
- **Admin, Architect, Blog, Budget, Chat, Consultation, File, Notification, Payment, Portfolio, Project Brief, Recommendation, Review, Saved, StyleQuiz, Support, Team, Analytics:** Each has its own controller and route file, e.g., `/api/architect/...`, `/api/blog/...`, etc.

### Controllers
- Each controller (e.g., `onboarding.controller.ts`) handles validation, business logic, and interacts with Prisma.
- Example: `submitHomeownerOnboarding` validates input, updates the user, and enforces role-based access.

### Middleware
- **`auth.ts`** — JWT authentication, attaches `user` to `req`
- **`role.ts`** — Role-based access control (e.g., `requireRole('CLIENT')`)
- **`errorHandler.ts`** — Centralized error handling
- **`rateLimit.ts`** — Rate limiting
- **`validate.ts`** — Request validation

### Models
- **Prisma models** (main)
- **Mongoose models** (legacy, e.g., `models/User.ts` — not used in production)

### Routes
- Each feature has a dedicated route file, e.g., `onboarding.routes.ts`, `auth.routes.ts`, etc.
- All routes are registered in `src/routes/index.ts`.

### Services
- **AI Service:** `services/ai.service.ts` — Handles AI-powered features
- **Other services** for business logic, integrations, etc.

### Utils
- **JWT:** `utils/jwt.ts` — Token generation/verification
- **Other utilities** as needed

---

## Frontend
### Frontend Structure
- `frontend/`
    - `src/`
        - `pages/` — Top-level pages (routed via React Router)
        - `components/` — Reusable UI components
        - `context/` — React context providers
        - `hooks/` — Custom React hooks
        - `lib/` — API client, utility libraries
        - `data/` — Static/mock data
        - `test/` — Test utilities
        - `App.tsx` — Main app entrypoint
        - `main.tsx` — React root
        - `index.css`, `App.css` — Styles
    - `public/` — Static assets
    - `package.json`, `tsconfig.json`, `vite.config.ts` — Project config

### Pages
- **Homeowner Onboarding:** `pages/homeowner/HomeownerOnboarding.tsx`
    - Multi-step form for onboarding
    - Submits data via `api.post` to backend
    - Handles validation, progress, and completion
- **Dashboard:** `pages/user/Dashboard.tsx` (and similar for architect, admin)
- **Auth:** `pages/auth/Login.tsx`, `pages/auth/Register.tsx`
- **Other pages:** For each backend feature (AI, blog, chat, etc.)

### Components
- **OnboardingGuard:** `components/auth/OnboardingGuard.tsx`
    - Redirects CLIENT users to onboarding if incomplete
- **UI Components:** Buttons, forms, modals, etc.
- **Feature Components:** For chat, notifications, project briefs, etc.

### API Client
- **`lib/api.ts`**
    - Centralized API abstraction
    - Generic `post` method for custom endpoints
    - Handles JWT auth, error handling
    - All API calls go through this client

### Context, Hooks, Lib, Data
- **Context:** Global state (e.g., auth, onboarding)
- **Hooks:** Custom hooks for API, auth, onboarding, etc.
- **Lib:** Utility libraries (e.g., API, validation)
- **Data:** Static/mock data for development

---

## Shared Types
- **`shared/types.ts`** — TypeScript types shared between backend and frontend (e.g., User, Role, OnboardingData)
- Ensures type safety across the stack

---

## Development & Build
- **Backend:**
    - `npm install` in `backend/`
    - `npx prisma generate` to generate Prisma client
    - `npm run dev` to start Express server
- **Frontend:**
    - `npm install` in `frontend/`
    - `npm run dev` to start Vite dev server
- **Shared:**
    - Types are imported from `shared/types.ts`
- **Testing:**
    - Vitest for frontend unit/integration tests
    - Backend tests (if present) in `test/`

---

## Onboarding Flow
- **Backend:**
    - `POST /api/onboarding/homeowner` — Accepts onboarding data, validates, updates user
    - `GET /api/onboarding/me` — Returns current onboarding state
- **Frontend:**
    - `HomeownerOnboarding.tsx` — Multi-step form, submits to backend
    - `OnboardingGuard.tsx` — Ensures onboarding is completed before accessing main app
- **Fields:** city, projectType, plotSize, budgetMin, budgetMax, preferredStyles, vastuPreference, timeline, familySize, projectStage
- **Validation:** Both frontend and backend validate allowed values

---

## Authentication & Authorization
- **JWT-based authentication**
- **Role-based access control** via `requireRole` middleware
- **Frontend** stores JWT in localStorage/session and attaches to API requests
- **User roles:** CLIENT (homeowner), ARCHITECT, ADMIN, SUPERADMIN

---

## Socket & Real-Time
- **Socket.io** used for real-time chat and notifications
- **Backend:** `src/socket.ts` — Socket server setup
- **Frontend:** Hooks/components for real-time updates

---

## Testing
- **Frontend:** Vitest, React Testing Library
- **Backend:** (If present) Jest or similar
- **Test utilities** in `frontend/src/test/`

---

## Deployment & Docker
- **Dockerfile** in `backend/` for backend container
- **docker-compose.yml** for multi-service orchestration (backend, db, etc.)
- **Vite** builds frontend for production
- **Environment variables** managed via `.env` files

---

## Appendix: File/Folder Reference
- **backend/controllers/** — All business logic for API endpoints
- **backend/middleware/** — Auth, role, error, validation middleware
- **backend/models/** — (Legacy) Mongoose models
- **backend/prisma/** — Prisma schema, migrations
- **backend/routes/** — API route definitions
- **backend/services/** — Business logic, integrations
- **backend/src/** — Entrypoints, config, main logic
- **backend/utils/** — Utility functions
- **frontend/src/pages/** — Top-level pages
- **frontend/src/components/** — Reusable UI components
- **frontend/src/context/** — React context
- **frontend/src/hooks/** — Custom hooks
- **frontend/src/lib/** — API client, utilities
- **frontend/src/data/** — Static/mock data
- **frontend/src/test/** — Test utilities
- **shared/types.ts** — Shared types
- **scripts/** — Utility scripts (e.g., seedDemoData)

---

## Summary
This documentation provides a comprehensive, detailed overview of the DomeLink project, covering every major file, folder, and feature. It is designed to help new developers, maintainers, and stakeholders understand the architecture, flow, and best practices of the codebase. For further details, refer to the specific files and folders as outlined above.
