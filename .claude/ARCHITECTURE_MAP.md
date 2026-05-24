# Architecture Map

## Directory Structure

```
src/
├── App.tsx               # Router — 3 hash-based routes
├── index.tsx             # Entry point — render root
├── index.css             # Tailwind 4 @theme tokens + mode CSS
├── test-setup.ts         # Vitest jsdom setup
│
├── views/                # Page-level components (one per route)
│   ├── GameLibrary.tsx       # /#/ — GameGrid + HeroSearch + NetworkIndicator
│   ├── PreGameDashboard.tsx  # /#/game/:id — TLDRList + DeepDiveTabs + Start FAB
│   └── LiveCompanion.tsx     # /#/game/:id/play — PhaseStepper + ActionAccordion
│
├── components/           # Reusable UI components
│   ├── StickyTopBar.tsx      # Fixed 56px header — back/logo left, ModeToggle right
│   ├── PhaseStepper.tsx      # Horizontal phase tabs (sticky in stealth mode)
│   ├── ActionAccordion.tsx   # CategoryGroup + ConditionToggle tree
│   ├── ConditionToggle.tsx   # Inline expand/collapse row — 150ms transition
│   ├── InlineYesNoFilter.tsx # Binary game-state filter — appends context WHERE clause
│   ├── GameCard.tsx          # Title + description tile on landing grid
│   └── NetworkIndicator.tsx  # Ghost offline icon in landing footer
│
├── store/
│   └── appState.ts       # appMode signal ('study'|'stealth') + toggle + localStorage + data-mode sync
│
├── db/
│   ├── schema.ts         # Zod schemas: GameSeedSchema, StrategySchema, PhaseEnum, TagEnum
│   ├── queries.ts        # SQLite query stubs — NOT YET IMPLEMENTED
│   ├── sqlite-client.ts  # PROD: Worker RPC + OPFS — NOT YET IMPLEMENTED
│   ├── sqlite-test-client.ts # TEST: in-process sqlite-wasm (no Worker, no OPFS) — NOT YET IMPLEMENTED
│   └── sqlite.worker.ts  # Web Worker — NOT YET IMPLEMENTED
│
└── types/
    └── domain.ts         # Canonical TS interfaces: Game, Strategy, Phase, Tag, AppMode

data/
└── seeds/                # JSON seed files per game (one file per game)

scripts/
└── ingest.ts             # NOT YET WRITTEN — Zod validate + SQLite UPSERT from seed JSON

public/
└── icons/                # PWA icons (192px, 512px) — NOT YET ADDED
```

## Data Flow

```
data/seeds/*.json
  → (build time) bundled into static output
  → (boot) sqlite-client reads seed files, UPSERTs into OPFS SQLite DB
  → (runtime) queries.ts executes typed SQL queries
  → (reactive) SolidJS Signals drive view re-renders on phase/filter change
```

## Theming

Single `data-mode="study"|"stealth"` attribute on `<body>` drives CSS token sets.
Toggle lives in `src/store/appState.ts`. Mode persisted to `localStorage`.

## PWA / Service Worker

`vite-plugin-pwa` with workbox — `registerType: 'prompt'`.
- `skipWaiting: false` + `clientsClaim: false` = no auto-activation
- Session lock: app posts `SESSION_ACTIVE` / `SESSION_ENDED` messages to SW
- SW defers update installation while session is active (route `/#/game/:id/play`)
- `.wasm` files: CacheFirst, 1-year TTL
- Seed JSON: StaleWhileRevalidate

## Key Invariants

- Only one `ConditionToggle` expanded at a time (auto-collapse on open)
- All text wraps — `text-overflow: ellipsis` forbidden
- Every interactive element: min `44px × 44px` tap target
- Phase sort: Setup(0) → Early Game(1) → Mid-Game(2) → End-Game(3) — never alphabetical
- TLDR-tagged strategies always hoisted to top of their category group
- Total app footprint must stay under 15 MB

---

**Last Updated**: 2026-05-23
