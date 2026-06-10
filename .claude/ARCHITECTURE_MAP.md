# Architecture Map

## Directory Structure

```
src/
├── App.tsx               # Router + ConfirmationContext.Provider
├── index.tsx             # Entry point — storage.persist() + seedsReady kickoff + render
├── index.css             # Tailwind 4 @theme tokens + active-mode aliases (--bg/--surface/--text/--muted/--accent)
├── test-setup.ts         # Vitest jsdom setup — MockWorker, localStorage, scrollIntoView, ResizeObserver
│
├── views/                # Page-level components (one per route)
│   ├── GameLibrary.tsx       # /#/ — fuzzy search, GameCard grid, NetworkIndicator
│   ├── PreGameDashboard.tsx  # /#/game/:id — TLDR list, DeepDiveTabs, Start Game FAB
│   └── LiveCompanion.tsx     # /#/game/:id/play — PhaseStepper + filter + accordion + wakeLock + session lock
│
├── components/           # Reusable UI components
│   ├── StickyTopBar.tsx      # Fixed 56px header — left/right slots, study/stealth border toggle
│   ├── ModeToggle.tsx        # Segmented 📖 Study | 🥷 Stealth control
│   ├── PhaseStepper.tsx      # Phase tab bar — sticky below top bar in stealth mode
│   ├── ActionAccordion.tsx   # CategoryGroup + ConditionToggle tree — exclusive expansion
│   ├── ConditionToggle.tsx   # Inline expand/collapse — 150ms grid-template-rows animation
│   ├── InlineYesNoFilter.tsx # Binary filter toggles — ephemeral, appends context to query
│   ├── GameCard.tsx          # Game tile — rounded+shadow in study, flat in stealth
│   └── NetworkIndicator.tsx  # Ghost offline icon (footer, landing only)
│
├── store/
│   └── appState.ts       # appMode signal ('study'|'stealth') + toggle + localStorage + data-mode sync
│
├── hooks/
│   └── use-confirmation.ts  # Promise-based context confirmation dialog
│
├── lib/
│   ├── strategy.ts       # Pure logic: resolveFilterContexts, filterByContext, groupByCategory, hoistTLDR, prepareStrategies
│   └── strategy.test.ts  # Unit tests for all lib/strategy functions
│
├── db/
│   ├── schema.ts         # Zod schemas: GameSeedSchema, StrategySchema, PhaseEnum, TagEnum
│   ├── schema.test.ts    # @vitest-environment node — validates all data/seeds/*.json against Zod
│   ├── sql-schema.ts     # SQL DDL: games, strategies, meta tables + indexes + ADDITIVE_MIGRATIONS
│   ├── index.ts          # TabletopDB class — SQLiteTable instances + query helpers + dbReady export
│   ├── seed.ts           # import.meta.glob seed loader — djb2 version hash, skip if unchanged
│   ├── sqlite-client.ts  # PROD: Worker RPC client — 10s timeout, reentrant transactions
│   ├── sqlite-test-client.ts # TEST: in-process sqlite-wasm (no Worker, no OPFS)
│   ├── sqlite-table.ts   # Generic SQLiteTable<T> ORM — where/orderBy/add/put/delete/count
│   └── sqlite.worker.ts  # Web Worker — OPFS SAH pool with 10-retry fallback to in-memory
│
└── types/
    └── domain.ts         # Canonical TS interfaces: Game, Strategy (id?), Phase, Tag, AppMode

data/
└── seeds/                # JSON seed files — one per game, validated by Zod at boot and in CI
    └── catan.json        # 16 strategies, all 4 phases, context-aware filter (leading/trailing)

public/
└── _headers              # Cloudflare Pages CSP + X-Content-Type-Options + Referrer-Policy

scripts/                  # (empty — seed validation runs via src/db/schema.test.ts)
```

## Data Flow

```
data/seeds/*.json
  → (build time) import.meta.glob bundles into JS chunks
  → (boot) seed.ts: djb2 hash → compare vs meta table → UPSERT if changed
  → (runtime) db.getStrategies(gameId) → SQLiteTable.where().toArray()
  → (reactive) prepareStrategies(strategies, activeContexts)
      → filterByContext → groupByCategory → sort alphabetical → hoistTLDR
  → SolidJS createMemo drives ActionAccordion re-render on phase/filter change
```

## DB Initialization Chain

```
index.tsx
  import './db/seed'           ← side-effect: starts seedsReady promise chain
  navigator.storage.persist()  ← prevent OPFS eviction

seed.ts
  seedsReady = dbReady.then(() => runSeedInit(db))

sqlite-client.ts (prod)  /  sqlite-test-client.ts (vitest alias)
  sqliteClient.ready = Worker 'init' message → OPFS SAH pool or fallback in-memory

Views use: createResource(() => seedsReady.then(() => db.getX()))
```

## Theming

Single `data-mode="study"|"stealth"` on `<body>` swaps active token aliases:

| Alias | Study | Stealth |
|-------|-------|---------|
| `--bg` | `#F8F7F4` | `#0D0B08` |
| `--surface` | `#FFFFFF` | `#1A1714` |
| `--text` | `#1A1A1A` | `#B8860B` |
| `--muted` | `#6B7280` | `#5C4A1E` |
| `--accent` | `#2563EB` | `#D4A017` |

Components use `var(--bg)`, `var(--accent)` etc. — no runtime JS switching needed.

## Test Architecture

| Layer | Files | Runner |
|-------|-------|--------|
| Unit (pure logic) | `src/lib/strategy.test.ts` | Vitest + jsdom |
| Seed validation | `src/db/schema.test.ts` | Vitest + node (reads filesystem) |
| Vitest alias | `sqlite-client` → `sqlite-test-client` | No Worker, in-process SQLite |

Coverage threshold: 80% on `src/lib/**`, `src/views/**`, `src/store/**`.

## PWA / Service Worker

`vite-plugin-pwa` — `registerType: 'prompt'`, `skipWaiting: false`, `clientsClaim: false`.

- `.wasm` → CacheFirst, 1-year TTL
- `data/seeds/*.json` → StaleWhileRevalidate
- Session lock: `LiveCompanion` posts `SESSION_ACTIVE` / `SESSION_ENDED` to the registration's active SW; the SW persists the flag in Cache Storage (`session-lock`) because the waiting SW — which receives `SKIP_WAITING` — is a separate instance, and idle SWs are killed mid-game. Stale locks expire after 8h and are cleared on activate.
- `navigator.wakeLock.request('screen')` on LiveCompanion mount, released on cleanup

## Key Invariants

- Only one `ConditionToggle` open at a time — `openId` signal in `ActionAccordion`
- All text wraps — `text-overflow: ellipsis` **forbidden**
- Every interactive element: min `44px × 44px` tap target
- Phase sort: Setup(0) → Early Game(1) → Mid-Game(2) → End-Game(3) — never alphabetical
- TLDR-tagged strategies always hoisted to top of their category group
- Category order alphabetical within a phase
- Condition order alphabetical within a category (after TLDR hoist)
- Total app footprint must stay under 15 MB (currently ~1.4 MB precache)

---

**Last Updated**: 2026-06-10
