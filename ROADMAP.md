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

---

## 📋 Nice-to-Have (v1.x)

### More Seed Files
High-value targets not yet added:
- Agricola
- Scythe
- Twilight Imperium
- Power Grid
- Puerto Rico

Use the AI ingestion prompt in spec §10.4 to generate.

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

**Last Updated**: 2026-05-24
