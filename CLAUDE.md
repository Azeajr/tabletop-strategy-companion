# CLAUDE.md

**Quick-start guide for Claude Code**

---

## Project Overview

**Tabletop Strategy Companion** — local-first, mobile-first PWA. Glanceable board game strategy at the physical table. Reactive state machine: Phase → Category → Condition → Strategy.

Full product spec: `/home/spark343/github/tabletop-strategy-companion-spec.md`

---

## Quick Start Commands

```bash
npm run dev      # Vite dev server
npm run build    # tsc + vite build
npm run preview  # preview production build
```

---

## Tech Stack

| Layer | Choice |
| :--- | :--- |
| Framework | SolidJS + `@solidjs/router` (hash-based) |
| Styling | Tailwind CSS 4.0 (`@tailwindcss/vite` plugin, CSS-first `@theme`) |
| Storage | SQLite Wasm + OPFS — stubs only, not yet implemented |
| Validation | Zod — schema defined, enforced at ingestion |
| Hosting | Cloudflare Pages (`tabletop-companion.pages.dev`) |
| CI/CD | GitHub Actions → `.github/workflows/deploy.yml` |

---

## Routing (Hash-based)

| Route | View |
| :--- | :--- |
| `/#/` | `GameLibrary` — game grid + fuzzy search |
| `/#/game/:id` | `PreGameDashboard` — TL;DR + "Start Game" FAB |
| `/#/game/:id/play` | `LiveCompanion` — PhaseStepper + accordion (session lock active) |

---

## Design Tokens (`src/index.css`)

All tokens defined as CSS custom properties in `@theme`. Mode switched via `data-mode="study"|"stealth"` on `<body>`.

```
Study:   bg #F8F7F4 | text #1A1A1A | accent #2563EB
Stealth: bg #0D0B08 | text #B8860B | accent #D4A017 | surface #1A1714 | muted #5C4A1E
```

---

## Project Structure

```
src/
  App.tsx               ← Router with 3 routes
  index.tsx             ← Entry point
  index.css             ← Tailwind 4 @theme tokens + mode CSS
  store/
    appState.ts         ← appMode signal ('study'|'stealth'), toggle, localStorage + data-mode sync
  db/
    schema.ts           ← Zod schemas: GameSeedSchema, StrategySchema, PhaseEnum, TagEnum
    queries.ts          ← SQLite query stubs (typed, not yet implemented)
  views/
    GameLibrary.tsx     ← stub
    PreGameDashboard.tsx ← stub
    LiveCompanion.tsx   ← stub
  components/           ← empty, to be built
data/
  seeds/                ← JSON seed files per game (format defined in spec §10.1)
scripts/                ← ingestion script (not yet written)
```

---

## Data Schema (entity hierarchy)

`Game → Phase → Category → Condition → Strategy`

Key rules:
- `phase` enum: `Setup | Early Game | Mid-Game | End-Game`
- `tags` enum (max 2): `TLDR | Offense | Defense | Economy | Pivot | Memory | Bluff | Transition | Closing`
- `strategy_stealth`: max 3 bullets × 50 chars each
- `strategy_detailed`: 20–300 chars
- Composite unique key: `(game_id, phase, category, condition)` → UPSERT
- `context` field on strategies: `null` = always show; string = shown only when matching InlineYesNoFilter state
- Games support up to 2 binary YesNo filters (`filter_1_label`, `filter_1_yes_context`, etc.)

Deterministic sort order: Phase (chronological) → Category (alpha) → TLDR hoist → Condition (alpha)

---

## UI Rules (enforced in all components)

- Min tap target: `44px × 44px`
- Min spacing between interactive rows: `8px`
- Horizontal padding on containers: `16px`
- `text-overflow: ellipsis` **forbidden** — text must wrap
- Only one `ConditionToggle` expanded at a time (auto-collapse)
- Toggle transition: `150ms`, hardware-accelerated, no spring/bounce
- Header: `56px` fixed height, sticky, `z-index: 50`
- Stealth mode: no shadows, no card borders, flat layout, screen sleep blocked via `navigator.wakeLock`
- Study mode: `border-radius: 12px` cards, ambient box-shadow

---

## PWA Rules

- App shell: Cache-First
- Seed data: Stale-While-Revalidate
- Session lock: service worker defers updates while `/#/game/:id/play` is active
- On boot: call `navigator.storage.persist()`
- Total footprint cap: **15 MB**
- Network indicator: ghost icon in landing footer (offline only, low-contrast)

---

## Deployment

- **URL:** https://tabletop-companion.pages.dev
- **GitHub:** https://github.com/Azeajr/tabletop-strategy-companion
- **Trigger:** push to `main` on paths: `src/**`, `public/**`, `data/seeds/**`, config files
- **Secret required:** `CLOUDFLARE_API_TOKEN` in GitHub repo secrets
- **Account ID:** `5141f0dec18e8fb0aa0942a9f09f982d`

---

## What's Built vs TODO

| Area | Status |
| :--- | :--- |
| Vite + SolidJS + Tailwind 4 scaffold | ✅ |
| Design tokens (`@theme`) | ✅ |
| Hash routing (3 routes) | ✅ |
| `appMode` signal + toggle + `data-mode` sync | ✅ |
| Zod schema (`schema.ts`) | ✅ |
| SQLite query stubs (`queries.ts`) | ✅ stub |
| GitHub Actions deploy pipeline | ✅ |
| Cloudflare Pages project (`tabletop-companion`) | ✅ |
| View stubs (GameLibrary, PreGameDashboard, LiveCompanion) | ✅ stub |
| SQLite Wasm + OPFS initialization | ❌ |
| Seed JSON files (Battleship, Catan, Sequence, Risk, Stratego) | ❌ |
| Ingestion script (`scripts/ingest.ts`) | ❌ |
| Components (StickyTopBar, PhaseStepper, ActionAccordion, etc.) | ❌ |
| Service worker (PWA, session lock, caching) | ❌ |
| PWA manifest + icons | ❌ |

---

## Deferred to v2

- My Meta layer (custom notes, failure flagging, strategy down-ranking)
- Post-game wrap-up (win/loss log, strategy performance, win-rate dashboard)
