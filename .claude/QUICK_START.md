# Quick Start Reference

## Commands

```bash
pnpm dev                 # Vite dev server (hot reload, port 5173)
pnpm build               # tsc + vite build
pnpm preview             # serve dist/ like Pages does (public/_headers applied, port 5176)
pnpm lint                # ESLint
pnpm test                # Vitest unit tests
pnpm test:coverage       # Vitest with v8 coverage (ratchet thresholds in vite.config.ts)
pnpm test:e2e            # Playwright against the production build
pnpm smoke               # production smoke: headers, SW, persistence, offline (needs dist/)
pnpm check               # build + test (pre-push gate)
pnpm check:ci            # lint + coverage + build — what CI's `checks` job runs
pnpm harness start       # agent session: owned server + iPhone 13 Mini WebKit (see harness.config.mjs)
```

## Routes (hash-based)

| URL | View | Status |
| :--- | :--- | :--- |
| `/#/` | `GameLibrary` — fuzzy search + game grid | ✅ |
| `/#/game/:id` | `PreGameDashboard` — TLDR list + phase deep-dive + Start FAB | ✅ |
| `/#/game/:id/play` | `LiveCompanion` — phase stepper + filter + accordion | ✅ |

## Adding a New Game

1. Create `data/seeds/<game-id>.json` following the format in spec §10.1
2. `game_id` must be kebab-case, 2–32 chars (e.g. `ticket-to-ride`)
3. All `condition` strings: 5–45 chars max
4. Run `pnpm test` — `src/db/schema.test.ts` validates all seed files automatically
5. Commit — GitHub Actions runs `pnpm test` → `pnpm build` → deploys to Cloudflare Pages
6. On next app load, `seed.ts` detects version hash mismatch and UPSERTs new data

## Key Files

| File | Purpose |
| :--- | :--- |
| `src/store/appState.ts` | `appMode` signal + toggle + `data-mode` body sync |
| `src/db/schema.ts` | Zod validation schemas for all seed entities |
| `src/db/sql-schema.ts` | SQL DDL — `games`, `strategies`, `meta` tables |
| `src/db/index.ts` | `TabletopDB` class — query helpers, `dbReady` export |
| `src/db/seed.ts` | Seed loader — `seedsReady` promise, version check |
| `src/lib/strategy.ts` | Pure logic — phase sort, context filter, TLDR hoist |
| `src/types/domain.ts` | Canonical TS interfaces (Game, Strategy, Phase, Tag) |
| `src/index.css` | Tailwind 4 `@theme` tokens + active-mode aliases |
| `vite.config.ts` | Vite + Vitest alias + PWA + CSP config |
| `public/_headers` | Cloudflare Pages CSP + security headers |

## Vitest SQLite Alias

Production imports `db/sqlite-client` (Worker + OPFS).
Tests automatically use `db/sqlite-test-client` (in-process, no Worker) via Vite alias:
```ts
// vite.config.ts test.alias
{ find: /\/sqlite-client$/, replacement: '/sqlite-test-client' }
```
No mocking needed — all DB code works identically in tests.

## Deploy

Push to `main` triggers GitHub Actions → `pnpm test` → `pnpm build` → Cloudflare Pages.
Live URL: https://tabletop-companion.pages.dev
