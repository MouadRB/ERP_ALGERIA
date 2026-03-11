# FERZA ERP

Algerian E-Commerce ERP | BFF Architecture | Vite + React | Node.js

## Stack
- **Frontend**: Vite + React (JS), TanStack Query, Tailwind CSS
- **BFF**: Node.js + Express, JWT + RBAC, Mock/Real toggle
- **Auth**: Keycloak (9-role RBAC)

## Quick Start
```bash
pnpm install
cp .env.example .env.development
pnpm dev
# Frontend: http://localhost:5173
# BFF:      http://localhost:4000
```

## Architecture
```
React App -> BFF (4000) -> Mock (dev) | Real Services (prod)
```

## Frontend Docs
- `docs/frontend/ARCHITECTURE.md` (target architecture + conventions)
- `docs/frontend/ARCHITECTURE_STATUS.md` (repo status vs the doc)
- Regenerate status: `node docs/frontend/generate-status.mjs`
