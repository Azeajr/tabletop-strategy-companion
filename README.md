# Tabletop Strategy Companion

Local-first, mobile-first PWA for glanceable board game strategy at the physical table. Reactive state machine: Phase → Category → Condition → Strategy.

**Live**: https://tabletop-companion.pages.dev

---

## Features

- **Study Mode** — full prose strategies, rounded cards, ambient shadows
- **Stealth Mode** — dark amber on obsidian, bullet-only, single-screen, screen wake lock
- **Fuzzy search** — find any game in under 2 seconds
- **Phase stepper** — tap to filter strategies by game phase
- **Context filters** — binary Yes/No toggles that show phase-relevant strategies only
- **Exclusive accordion** — one condition open at a time, 150ms animation
- **Offline-first** — SQLite Wasm + OPFS, service worker precache, no network needed at the table

---

## Stack

| Layer | Choice |
| :--- | :--- |
| UI | SolidJS 1.9 + TypeScript 6 |
| Styling | Tailwind CSS 4 |
| Routing | `@solidjs/router` (hash-based) |
| Storage | `@sqlite.org/sqlite-wasm` (Web Worker + OPFS) |
| Validation | Zod 4 |
| Build | Vite 8 + `vite-plugin-pwa` (Workbox) |
| Testing | Vitest 4 + `@solidjs/testing-library` |
| Deploy | Cloudflare Pages via GitHub Actions |

---

## Quick Start

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # 10 unit + seed validation tests
npm run build     # production build
```

---

## Adding Games

Drop a JSON file into `data/seeds/`:

```json
{
  "game_id": "ticket-to-ride",
  "game_name": "Ticket to Ride",
  "game_description": "Route-building across North America, 2-5 players.",
  "filter_1_label": "Are you winning on routes?",
  "filter_1_yes_context": "route-lead",
  "filter_1_no_context": "route-trail",
  "filter_2_label": null,
  "filter_2_yes_context": null,
  "filter_2_no_context": null,
  "strategies": [
    {
      "phase": "Setup",
      "category": "Ticket Selection",
      "condition": "Choosing initial destination tickets",
      "strategy_detailed": "Keep the longest ticket you drew. Long routes score disproportionately and give you a backbone to build other routes around.",
      "strategy_stealth": ["Keep the longest ticket", "Build backbone first", "Aim for coast-to-coast"],
      "tags": ["TLDR", "Economy"],
      "context": null
    }
  ]
}
```

Run `npm test` to validate, then commit. CI deploys automatically.

Full schema spec: `tabletop-strategy-companion-spec.md`.

---

## Architecture

```
data/seeds/*.json
  → (build) import.meta.glob bundles into JS
  → (boot) seed.ts: version hash → UPSERT if changed → SQLite OPFS
  → (runtime) createResource → db.getStrategies() → prepareStrategies()
  → SolidJS signals drive re-render on phase/filter change
```

See `.claude/ARCHITECTURE_MAP.md` for full details.

---

## Project Structure

```
src/
├── views/          # GameLibrary, PreGameDashboard, LiveCompanion
├── components/     # StickyTopBar, ModeToggle, PhaseStepper, ActionAccordion, …
├── lib/            # Pure logic — strategy sort, filter, TLDR hoist
├── db/             # SQLiteTable ORM, Worker client, seed loader
├── hooks/          # use-confirmation (Promise-based dialog)
├── store/          # appState (study/stealth mode)
└── types/          # domain.ts — Game, Strategy, Phase, Tag
data/seeds/         # Game JSON files (Catan included)
public/_headers     # Cloudflare Pages CSP headers
```
