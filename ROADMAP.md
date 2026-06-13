# Roadmap

Tracks what's built, what's spec-required but incomplete, and what's deferred to v2.

---

## ✅ Shipped (v1.0)

- SQLiteTable<T> ORM + Worker client + in-process test client (Vite alias)
- Seed loader — `import.meta.glob`, djb2 version hash, skip-if-unchanged
- `meta` table for seed versioning
- All 3 views: GameLibrary, PreGameDashboard, LiveCompanion
- All 8 components: StickyTopBar, ModeToggle, GameCard, NetworkIndicator, PhaseStepper, ConditionToggle, ActionAccordion, InlineYesNoFilter
- Study ↔ Stealth mode toggle — CSS variable swap, no JS theming
- Pure strategy logic: phase sort, context filter, category group, TLDR hoist
- Catan seed (16 strategies, 4 phases, leading/trailing context filters)
- Screen wake lock + SW session lock messages in LiveCompanion
- Stealth scroll lock (`overflow-hidden`)
- CSP headers (`public/_headers` + Vite preview)
- Zod seed validation test + 9 strategy unit tests

## ✅ Shipped (v1.1)

- **SW Session Lock** — switched to `injectManifest` mode; `src/sw.ts` blocks `skipWaiting` while `SESSION_ACTIVE`
- **Bundle Size CI** — 15 MB hard cap in `.github/workflows/deploy.yml`
- **PWA Update Prompt** — `useRegisterSW` wired in GameLibrary; "Update available" banner, never shown mid-game
- **PWA Icons** — 192×192 and 512×512 PNG icons generated at `public/icons/`; `scripts/gen-icons.mjs` for regeneration
- **Game-Not-Found State** — `<Show>` fallback with "Game not found" + back link in PreGameDashboard
- **Error Boundary for DB Init Failure** — `<ErrorBoundary>` in `App.tsx` with retry button
- **Stealth Deep-Dive Tabs** — PreGameDashboard now shows `strategy_stealth` bullets in Stealth mode
- **Filter Default State** — `InlineYesNoFilter` defaults to null (unset); tap same button again to clear
- **Keyboard Navigation** — ArrowUp/ArrowDown between ConditionToggle rows
- **Swipe Gesture on PhaseStepper** — horizontal swipe (≥50px) advances/retreats phase
- **Search in LiveCompanion** — filter input narrows strategies by condition text
- **8 new seed files** — Ticket to Ride, Pandemic, Wingspan, 7 Wonders, Terraforming Mars, Risk, Stratego, Sequence
- **Component tests** — ActionAccordion (6 tests), InlineYesNoFilter (7 tests); 24 tests total passing

## ✅ Shipped (v1.2)

- **Strategy & UX Validation loop (Pass 5)** — `ENGINEERING_PASSES.md` §5 + `retro/` (see `retro/README.md`, `retro/TEMPLATE.md`). Per-game (or cross-cutting) audit across three axes — strategic optimality, prose/delivery, decomposition-model fit. Writes a dated retro, ships bounded in-seed fixes, opens issues for model changes. **All 20 seeds audited** (`retro/2026-06-13-*.md`).
- **Loop-game nav** — `nav_style: 'arc' | 'modes'` on the seed; `PhaseStepper` renders free-select mode tabs (no progression affordance) for loop games. Battleship remodeled into Searching / Targeting / Defense modes.
- **Tag badges** — the 8 non-TLDR tags render as inline chips (`TagBadges`) on conditions; TLDR stays hoist-only.
- **Explicit strategy order** — optional `order` field; `prepareStrategies` sorts by `order` then condition-alphabetical, categories by min member order. Legacy seeds (order 0) render unchanged.
- **Stealth one-screen guarantee** — each phase collapses to its TLDR strategies by default with a "show all" toggle that scrolls; a ≤8 collapsed-row budget is enforced in `schema.test`.
- **Test growth** — 101 tests (added `order`, tag-render, PhaseStepper arc/modes, stealth glanceability + row-budget guards).

---

## 📋 Nice-to-Have (v1.x)

### More Seed Files
High-value targets not yet added:
- Agricola
- Scythe
- Twilight Imperium
- Power Grid
- Puerto Rico

Use the AI ingestion prompt in spec §10.4 to generate. After authoring, run **Pass 5** (`ENGINEERING_PASSES.md` §5) to validate the new seed and drop its retro in `retro/`.

### Re-audit & deferred UX
- Re-run **Pass 5** per game as the competitive meta shifts or after a seed edit; retros are append-only — supersede an old one with a new dated file (`retro/YYYY-MM-DD-<game-id>.md`).
- Stealth density: if a 7–8 row phase plus an open toggle still feels tight on a small phone, add per-mode TLDR-only collapse in stealth (deferred from the #7 row-budget fix).

### E2E Tests (Playwright)
No e2e tests exist. Golden path to cover:
1. Land on GameLibrary → search → click game → Start Game → tap phase → expand condition
2. Toggle Study ↔ Stealth mid-game
3. Context filter toggles show/hide strategies correctly

### Stryker Mutation Testing
Training-log runs Stryker on `src/lib/**`. Add it here for `lib/strategy.ts` — logic is pure and easy to mutate-test.

```bash
npm install --save-dev @stryker-mutator/core @stryker-mutator/vitest-runner @stryker-mutator/typescript-checker
```

---

## 🚫 Out of Scope (v2)

Per spec §11 — do not implement in v1:

- **"My Meta" layer** — custom per-condition notes, failure flagging, strategy down-ranking
- **Post-game wrap-up** — win/loss logging, strategy performance tracking, win-rate dashboard

---

**Last Updated**: 2026-06-13
