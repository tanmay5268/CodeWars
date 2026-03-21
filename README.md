# Turborepo + Express API + Prisma + PostgreSQL (Monorepo Setup Guide)

This repository is a **beginner-friendly, real-world monorepo** showing how to combine:

- **Turborepo** (task runner + caching for monorepos)
- **pnpm workspaces** (link local packages with `workspace:*`)
- **Express API** written in **TypeScript**
- **Prisma** as the ORM
- **PostgreSQL** as the database
- Shared internal workspace packages like:
  - `@repo/db` (Prisma + database client)
  - `@repo/utils` (shared utilities)
  - `@repo/typescript-config` (shared TS configs)
  - `@repo/eslint-config` (shared lint rules)

The goal is to make it easy to understand **what goes where**, **why each config exists**, and **how to add new packages** cleanly as the repo grows.

---

## Table of contents

- [1. Repository layout](#1-repository-layout)
- [2. Requirements](#2-requirements)
- [3. One-time setup (install + database + prisma)](#3-one-time-setup-install--database--prisma)
- [4. Running the API (dev + build + start)](#4-running-the-api-dev--build--start)
- [5. How Turborepo is configured (`turbo.json`)](#5-how-turborepo-is-configured-turbojson)
- [6. How pnpm workspaces are configured (`pnpm-workspace.yaml`)](#6-how-pnpm-workspaces-are-configured-pnpm-workspaceyaml)
- [7. Root scripts and conventions (`package.json` at repo root)](#7-root-scripts-and-conventions-packagejson-at-repo-root)
- [8. TypeScript strategy: shared configs](#8-typescript-strategy-shared-configs)
- [9. Database strategy: `@repo/db` + Prisma](#9-database-strategy-repodb--prisma)
- [10. How internal packages are consumed (the `workspace:*` rule)](#10-how-internal-packages-are-consumed-the-workspace-rule)
- [11. Adding a new package (step-by-step)](#11-adding-a-new-package-step-by-step)
- [12. Common problems + fixes](#12-common-problems--fixes)
- [13. Recommended improvements (important for a GitHub-ready setup)](#13-recommended-improvements-important-for-a-github-ready-setup)
- [14. Command cheat sheet](#14-command-cheat-sheet)

---

## 1. Repository layout

This monorepo follows the standard Turborepo pattern:

- `apps/*` → runnable applications (API server, web app, docs app, etc.)
- `packages/*` → reusable libraries/config packages shared across apps

Typical layout:

```txt
├─ apps/
│  ├─ api/                      # Express backend (TypeScript)
│  ├─ web/                      # (optional) Next.js app
│  └─ docs/                     # (optional) Next.js app
├─ packages/
│  ├─ db/                       # Prisma schema/migrations + Prisma client export
│  ├─ utils/                    # shared helper functions
│  ├─ typescript-config/        # shared tsconfig presets (base/nextjs/react-library)
│  └─ eslint-config/            # shared lint config (if present)
├─ turbo.json                   # Turborepo task graph (build/dev/lint/check-types)
├─ pnpm-workspace.yaml          # tells pnpm which folders are workspace packages
├─ package.json                 # root scripts (turbo run ...)
└─ README.md
```

---

## 2. Requirements

This repo is configured for:

- **Node.js >= 18** (see `engines.node`)
- **pnpm 9** (see `packageManager`)

Install pnpm if needed:

```bash
npm i -g pnpm
```

Verify:

```bash
node -v
pnpm -v
```

Database requirements:

- PostgreSQL running locally **or**
- PostgreSQL running in Docker (recommended for easy onboarding)
- PostgreSQL running on neon.tech or prisma.console.tech
 #### You just need a connection string, any of the above options work fine
---

## 3. One-time setup (install + database + prisma)

### 3.1 Install dependencies

From the repo root:

```bash
cd /home/tanmay/Desktop/code-wars
pnpm install
```

Because this is a monorepo, pnpm will install and link internal workspace packages automatically.

### 3.2 Configure `DATABASE_URL`

Prisma needs a connection string. Set `DATABASE_URL` in an `.env` file.

**Local Postgres example:**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codewars?schema=public"
```

> If you previously saw: `P1001 Can't reach database server at "base"`
> That means your DB host is set to `base` (often a Docker service name), but your API/Prisma process is not running in the same Docker network. If your DB is local or port-forwarded, use `localhost`.

### 3.3 Generate Prisma client + run migrations

This repo’s Prisma work is typically done from `packages/db`.

Run:

```bash
cd packages/db
pnpm exec prisma generate
pnpm exec prisma migrate dev --name init
```

What these do:

- `prisma generate` creates the Prisma client based on `schema.prisma`.
- `prisma migrate dev` creates/applies migrations and updates your dev database schema.

---

## 4. Running the API (dev + build + start)

### 4.1 Development mode

API dev script (from `apps/api/package.json`) uses:

- `nodemon` → watches `src`
- `tsx` → runs TypeScript entry directly (no build step required)

Run only the API from repo root:

```bash
pnpm --filter ./apps/api dev
```

### 4.2 Production build and start

A typical pattern is:

- `pnpm --filter ./apps/api build`
- `pnpm --filter ./apps/api start`

Depending on your app’s `tsconfig` and `build` output, `start` runs `dist/index.js`.

---

## 5. How Turborepo is configured (`turbo.json`)

Your `turbo.json` is:

```json
{
  "$schema": "https://turborepo.dev/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "check-types": {
      "dependsOn": ["^check-types"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### What this means (in practical terms)

#### `build`
- `"dependsOn": ["^build"]` means: before building a package/app, Turbo builds its dependencies first.
- `"inputs": ["$TURBO_DEFAULT$", ".env*"]` means: cache keys include code + env changes. If `.env` changes, Turbo will treat build output as invalid.
- `"outputs": [".next/**", ...]` is optimized for Next.js apps.

**Important note for this repo:**
Your API (Express) likely outputs to `dist/`, not `.next/`. If you want Turbo caching to correctly track API builds, you typically add outputs like:

- `dist/**`
- maybe `generated/**` for Prisma client (depending on how you generate/commit it)

You *can* keep `.next/**` for `apps/web` and also add `dist/**` for other packages. (See [Recommended improvements](#13-recommended-improvements-important-for-a-github-ready-setup).)

#### `dev`
- `cache: false` → dev tasks should not be cached
- `persistent: true` → dev tasks keep running (watch mode)

#### `lint` / `check-types`
Both depend on running the same task in upstream dependencies first.

---

## 6. How pnpm workspaces are configured (`pnpm-workspace.yaml`)

Your workspace file:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

Meaning:

- Every folder in `apps/*` becomes a workspace package (if it has a `package.json`).
- Every folder in `packages/*` becomes a workspace package (if it has a `package.json`).

This is what enables `workspace:*` dependencies to work.

---

## 7. Root scripts and conventions (`package.json` at repo root)

Your root `package.json`:

```json
{
  "name": "code-wars",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "check-types": "turbo run check-types"
  },
  "devDependencies": {
    "prettier": "^3.7.4",
    "turbo": "^2.8.20",
    "typescript": "5.9.2"
  },
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "node": ">=18"
  },
  "imports": {
    "@repo/*": "./packages/*"
  },
  "dependencies": {
    "@prisma/client": "^7.5.0",
    "prisma": "^7.5.0"
  }
}
```

### What’s important here

#### Root scripts are “entry points” for the whole repo
- `pnpm dev` → runs all `dev` tasks across packages/apps (as defined in `turbo.json`)
- `pnpm build` → builds everything in correct dependency order
- `pnpm check-types` → typechecks everything in correct order
- `pnpm format` → formats TS/TSX/MD files everywhere

#### `imports` mapping: `@repo/*`
You have:

```json
"imports": {
  "@repo/*": "./packages/*"
}
```

This is a Node.js import-maps style feature (useful in some contexts), but **for TypeScript + bundlers**, the most reliable “monorepo sharing” mechanism is still:

1. each package having a real `name` like `@repo/db`
2. consumers depending on it via `"workspace:*"`
3. package exports/types being correctly defined

So: keep `imports` if you like it, but don’t rely on it as the only linking mechanism.

#### Prisma deps at the root
You have `prisma` and `@prisma/client` in root dependencies. That can work, but in many monorepos Prisma is owned by the `@repo/db` package (which you already do). Keeping them at the root is not “wrong”, but it’s something to be consistent about:
- either Prisma is a root tool used by many packages
- or Prisma is owned by `packages/db`

---

## 8. TypeScript strategy: shared configs

This repo uses a dedicated TS config package:

### `packages/typescript-config`

Contents:

- `base.json` → general strict TypeScript defaults
- `nextjs.json` → Next.js-specific TS config
- `react-library.json` → for React component libraries

`base.json` (key parts):

- strict mode enabled
- `module` + `moduleResolution` are `NodeNext` (good for modern Node ESM/CJS interop)
- `target` is `ES2022`

`nextjs.json` extends base but switches to:
- `module: ESNext`
- `moduleResolution: Bundler`
- `jsx: preserve`
- `noEmit: true`

`react-library.json` extends base but sets:
- `jsx: react-jsx`

### Why this pattern matters
Instead of duplicating TS settings in every package, you extend one of these configs. When you change your default TS rule, it updates everywhere.

### Your API’s current `tsconfig.json`
You shared `apps/api/tsconfig.json`, which currently does:

- `extends: "../../tsconfig.json"`

That implies you also have a root `tsconfig.json` (not shown in the snippet). This works fine if your root tsconfig is the “base”.

**Beginner-friendly recommendation (optional):**
You can also set API tsconfig to extend your shared config directly:

- Node service → extend the base config
- Next.js app → extend `nextjs.json`
- React library → extend `react-library.json`

This keeps your TS strategy consistent with your monorepo design.

---

## 9. Database strategy: `@repo/db` + Prisma

### `packages/db/package.json` highlights

```json
{
  "name": "@repo/db",
  "private": true,
  "main": "index.ts",
  "types": "index.ts",
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@types/node": "^22.15.3",
    "prisma": "^7.5.0",
    "tsx": "^4.21.0",
    "typescript": "^5.9.3"
  },
  "dependencies": {
    "@prisma/adapter-pg": "^7.5.0",
    "@prisma/client": "^7.5.0",
    "dotenv": "^17.3.1",
    "pg": "^8.20.0"
  }
}
```

This tells you:
- Prisma is installed in the DB package (good).
- Postgres adapter + `pg` are installed (DB package is responsible for DB connectivity).
- Node typings are installed here (fixes `process` type issues inside the DB package).

### Prisma schema

Your Prisma schema models:

- `User` with unique `email`
- `Post` related to `User` (one-to-many)

You also configured:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}
```

That means Prisma client is generated into:

- `packages/db/generated/prisma`

This is a valid approach, but it has implications:

- Your `@repo/db` package should export the Prisma client from a stable path.
- Consumers should not import deep internal generated files directly.
- You may need to ensure the generated output is included in builds and not accidentally ignored.

### Prisma config file (`prisma.config.ts`)
You’re using Prisma’s config approach to provide datasource URL via `process.env["DATABASE_URL"]`.

That means:
- you must have `DATABASE_URL` available when running Prisma commands and when running runtime DB code.

---

## 10. How internal packages are consumed (the `workspace:*` rule)

This repo uses pnpm’s workspace linking.

### The rule
If an app imports an internal package, it **must** depend on it:

```json
{
  "dependencies": {
    "@repo/db": "workspace:*",
    "@repo/utils": "workspace:*"
  }
}
```

### Why it matters
- avoids “works on my machine” issues
- makes dependency graphs explicit
- lets Turbo build tasks in the right order

---

## 11. Adding a new package (step-by-step)

This is the part most beginners struggle with, so this section is intentionally detailed.

### Goal
Add a new package `@repo/logger` and use it from `apps/api`.

---

### Step 1 — Create the folder

```bash
mkdir -p packages/logger/src
```

---

### Step 2 — Create `packages/logger/package.json`

```json
{
  "name": "@repo/logger",
  "version": "0.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "dev": "tsc -w",
    "build": "tsc -b",
    "lint": "echo \"Add lint\"",
    "check-types": "tsc -p tsconfig.json --noEmit"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.9.3"
  }
}
```

Notes:
- `main` and `types` should point to emitted output (not `.ts` files) for best compatibility.
- include a `check-types` script so Turbo can run it.

---

### Step 3 — Create `packages/logger/tsconfig.json`

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src"]
}
```

---

### Step 4 — Add code `packages/logger/src/index.ts`

```ts
export function logInfo(message: string) {
  console.log(`[logger] ${message}`);
}
```

---

### Step 5 — Install/link in workspace

From repo root:

```bash
pnpm install
```

---

### Step 6 — Add dependency to the API app

In `apps/api/package.json`:

```json
{
  "dependencies": {
    "@repo/logger": "workspace:*"
  }
}
```

---

### Step 7 — Use it in API code

```ts
import { logInfo } from "@repo/logger";

logInfo("API booting...");
```

---

### Step 8 — Run API

```bash
pnpm --filter ./apps/api dev
```

If it fails to resolve, check:
- `packages/logger/package.json` has the correct `"name": "@repo/logger"`
- API lists it as dependency
- you ran `pnpm install` after creating the package
- TypeScript server in VS Code may need restart

---

## 12. Common problems + fixes

### Problem: Prisma error `P1001 Can't reach database server`
Cause: `DATABASE_URL` host is wrong/unreachable.

- Local DB: use `localhost`
- Docker DB with port forwarding: still use `localhost`
- Both API + DB in same Docker network: use the docker compose service name

Debug quickly:

```bash
echo $DATABASE_URL
ss -ltnp | grep 5432 || true
docker ps
```

### Problem: TypeScript says `Cannot find name 'process'`
Install Node typings in the package that is typechecking:

```bash
pnpm add -D @types/node
```

Then restart TS server in VS Code:
- `Ctrl+Shift+P` → “TypeScript: Restart TS server”

### Problem: `prisma` command not running
Run Prisma through pnpm from the correct package:

```bash
cd packages/db
pnpm exec prisma -v
```

If you try `prisma` directly, it might not be in PATH.

---

## 13. Recommended improvements (important for a GitHub-ready setup)

These additions make the repo much more “copy/paste runnable” for others.

### 13.1 Add `.env.example`
So people know what to set:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DBNAME?schema=public"
```

### 13.2 Add a DB Docker Compose (optional but highly recommended)
This is the fastest beginner onboarding:
- `docker compose up -d`
- set `DATABASE_URL`
- run migrations
- done

### 13.3 Fix Turbo build outputs for non-Next apps/packages
Right now Turbo `build.outputs` is configured for `.next/**`.

For Express/packages, consider also including:
- `dist/**`
- `packages/db/generated/**` (if you rely on generated output)
- or change Prisma output to the standard default and rely on `@prisma/client`

This improves caching correctness and avoids confusing builds.

### 13.4 Make `@repo/db` package export stable build output
Currently `packages/db` has:

```json
"main": "index.ts",
"types": "index.ts"
```

That is convenient in dev, but for broader compatibility (and production builds), it’s usually better to emit JS + `.d.ts` into `dist/` and point `main/types` to `dist`.

If your audience is beginners, explaining this in the repo is a big plus (even if you don’t implement it yet).

### 13.5 Add CI (GitHub Actions)
At minimum:
- `pnpm install`
- `pnpm check-types`
- `pnpm lint`
- `pnpm build`

It proves the repo works for others.

---

## 14. Command cheat sheet

From repo root:

```bash
# install all workspace deps
pnpm install

# run all dev tasks (turbo)
pnpm dev

# run only api
pnpm --filter ./apps/api dev

# build everything
pnpm build

# typecheck everything
pnpm check-types

# format
pnpm format
```

Prisma (DB package):

```bash
pnpm --filter ./packages/db exec prisma generate
pnpm --filter ./packages/db exec prisma migrate dev
pnpm --filter ./packages/db exec prisma studio
```

---

## Notes for readers

This repo is intentionally structured to be extended:
- add more backend services in `apps/*`
- add more reusable libraries in `packages/*`
- keep shared configuration in `packages/typescript-config` and `packages/eslint-config`

If you clone this repo and run into an issue, the first things to verify are:
1. your `DATABASE_URL`
2. your DB is running and reachable
3. you ran `prisma generate` + migrations
4. you installed all workspace packages with `pnpm install`
