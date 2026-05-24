# Quick Start Reference

## Commands

```bash
npm run dev              # Vite dev server (hot reload)
npm run build            # tsc + vite build
npm run preview          # preview production build (port 5175)
npm run lint             # ESLint
npm test                 # Vitest unit tests
npm run test:coverage    # Vitest with v8 coverage report
npm run check            # build + test (pre-push gate)
```

## Routes (hash-based)

| URL | View |
| :--- | :--- |
| `/#/` | `GameLibrary` — game grid + fuzzy search |
| `/#/game/:id` | `PreGameDashboard` — TL;DR + Start Game FAB |
| `/#/game/:id/play` | `LiveCompanion` — PhaseStepper + accordion |

## Adding a New Game

1. Create `data/seeds/<game-id>.json` following the format in spec §10.1
2. Run ingestion script: `npx tsx scripts/ingest.ts` (not yet written)
3. Commit — GitHub Actions deploys to Cloudflare automatically

## Key Files

| File | Purpose |
| :--- | :--- |
| `src/store/appState.ts` | `appMode` signal + toggle + `data-mode` body sync |
| `src/db/schema.ts` | Zod validation schemas for all entities |
| `src/db/queries.ts` | SQLite query layer (stubs — not yet implemented) |
| `src/types/domain.ts` | Canonical TS interfaces (Game, Strategy, Phase, Tag) |
| `src/index.css` | Tailwind 4 `@theme` tokens (study + stealth palettes) |
| `vite.config.ts` | Vite + Vitest + PWA + CSP config |

## Deploy

Push to `main` triggers GitHub Actions → Cloudflare Pages.
Live URL: https://tabletop-companion.pages.dev
