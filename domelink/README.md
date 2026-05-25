<div align="center">
  <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80" alt="DomeLink Premium Residence" width="900" style="border-radius: 12px; margin-bottom: 24px;" />
  <h1 align="center">DomeLink</h1>
  <p align="center"><strong>The Elite Architectural Ecosystem & Premium Discovery Platform</strong></p>

  <p align="center">
    DomeLink bridges the gap between visionary homeowners and verified architectural studios.<br /> It is a production-ready, highly observable, AI-assisted SaaS platform designed to remove friction, uncertainty, and opacity from the modern construction and renovation process.
  </p>

  <p align="center">
    <a href="#quick-start--demo-mode"><strong>Recruiter & Demo Quick Start</strong></a> ·
    <a href="ARCHITECTURE.md">Architecture Hub</a>
  </p>
</div>

---

## ✦ The Vision
Most homeowners navigate architecture through unverified portfolios, opaque pricing, and fragmented communication. **DomeLink replaces uncertainty with intelligence.** 

By leveraging proprietary AI (Avora Intelligence) and strict government-level architect verifications, DomeLink ensures that every project is conceptually sound, financially feasible, and perfectly matched to the right studio before a single message is sent.

## ✦ Feature Matrix

| Pillar | Features | Tech implementation |
| :--- | :--- | :--- |
| **Avora Intelligence**   | Regional cost feasibility, timeline modeling, predictive budget breaking. | `@sentry/node`, `Groq Llama-3`, Redis-like `aiCache`. |
| **Trust Security Space** | Suspicious request tracking, JWT rotations, aggressive rate limiting.    | `helmet`, `zod`, custom `suspiciousRequestDetector`. |
| **Cinematic Discovery**  | Smooth Framer Motion transitions, WebGL hero elements, dark mode natively. | `framer-motion`, `@react-three/fiber`, `shadcn/ui`. |
| **Enterprise Tracking**  | Event logging, conversion tracking, webhook chron-retry handlers.          | `Prisma`, `PostgreSQL`, Background cron workers. |

## ✦ Recruiter / Demo Quick Start
This ecosystem is completely seeded with interactive demo data to showcase the entire product lifecycle without tedious manual setup.

### Launching the Application

**1. Clone & Install**
```bash
git clone https://github.com/DomeLink/domelink.git
cd domelink

# Backend
cd backend
npm install
cp .env.example .env

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

**2. Seed the Production Demo Dataset**
We have included a flawless demo generation script that creates verified architectural profiles, complex residential projects, analytics histories, and pre-calculated AI reports.
```bash
cd backend
npm run prisma:generate  # (Setup Prisma schemas)
npm run seed             # (Inject the showcase dataset)
```

**3. Run the Monorepo**
```bash
# In backend terminal
npm run dev

# In frontend terminal
npm run dev
```

### Accessing Demo Accounts
Navigate to `http://localhost:8080/choose` to log in instantly. Use the following seeded accounts:
* **The Client (Homeowner):** `demo.client@domelink.com`
* **The Architect (Premium Studio):** `demo.architect@domelink.com`

**Password for all demo accounts:** `demo123`

---

## ✦ Architecture Overview

DomeLink handles deep complexity efficiently. The tech stack relies on robust types passing seamlessly from the database to the browser.
* **Database:** `PostgreSQL` powered by `Prisma ORM`
* **Backend Engine:** `Node.js` + `Express` + `Zod` (Runtime Validation)
* **Frontend UI:** `React 18` + `Vite` + `TailwindCSS` + `Radix Primitives`
* **Realtime Layer:** `Socket.io` (for active consultations and notifications)

👉  **[Read the Full System Architecture Guide](ARCHITECTURE.md)** — Includes deep-dive Mermaid diagrams mapping the AI fallback states, request lifecycles, and database relationships.

## ✦ Deployment & Scale
DomeLink is fully optimized for horizontal scaling and enterprise deployment via Docker and PM2.

* **Asset Optimization:** Code-splitting logic groups ThreeJS, Motion, and React runtimes into isolated manual chunks to ensure lightning-fast Time-to-Interactive metrics.
* **Production Observability:** `Sentry` is globally integrated for both node profiling and browser playback traces.
* **Resilience:** If the AI provider experiences outages, deterministic fallback algorithms ensure the user never experiences a broken UI.

---
<p align="center"><small>DomeLink Platform · For Portfolios, Investors, and Architectural Visionaries · 2026</small></p>
