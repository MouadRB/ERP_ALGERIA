# Ferza ERP Frontend

This repository contains the ERP frontend and supporting packages following the provided architecture.

## Install

```bash
corepack enable
corepack pnpm install
```

## Run

```bash
npm run dev
```

## Environment

Copy the example env file for the web app:

```bash
copy apps\\web\\.env.local.example apps\\web\\.env.local
```

## Structure

- `apps/web`: Next.js 14 App Router frontend
- `apps/bff`: Node.js/Express BFF placeholder
- `packages/shared`: Shared types, constants, and utilities

## Adding New Modules

1. Create a new module under `apps/web/modules/{module}` with `components/`, `hooks/`, and `index.ts`.
2. Add routes under `apps/web/app/[locale]/(app)/{module}` with `page.tsx` and `loading.tsx`.
3. Add translation keys under `apps/web/messages/{locale}/{module}.json`.
4. Create hooks that use mock data until the backend is ready.
