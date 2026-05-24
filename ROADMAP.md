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
- CI: `npm test` before build

---

## 🔧 Spec-Required, Not Yet Complete

### SW Session Lock (§8.3)
Client posts `SESSION_ACTIVE` / `SESSION_ENDED` to SW ✅ but the **generated Workbox SW ignores those messages**. Workbox's `generateSW` mode doesn't support custom message handlers.

**Fix**: Switch `vite-plugin-pwa` to `injectManifest` mode. Write `src/sw.ts` that:
- Intercepts `message` events
- Sets a `sessionActive` flag
- Blocks `self.skipWaiting()` while flag is true
- Resumes when `SESSION_ENDED` received

### Bundle Size CI Check (§8.5)
Spec requires a build-time hard cap of 15 MB enforced in GitHub Actions. Not implemented.

**Fix**: Add step to `.github/workflows/deploy.yml`:
```bash
node -e "
  const {readdirSync, statSync} = require('fs');
  const walk = d => readdirSync(d, {withFileTypes:true})
    .flatMap(f => f.isDirectory() ? walk(d+'/'+f.name) : [d+'/'+f.name]);
  const bytes = walk('dist').reduce((s,f) => s + statSync(f).size, 0);
  if (bytes > 15_000_000) { console.error('Bundle exceeds 15MB:', bytes); process.exit(1); }
"
```

### PWA Update Prompt UI
`registerType: 'prompt'` generates the `useRegisterSW` hook but nothing renders the "Update available" banner. Users never see new content.

**Fix**: Wire `useRegisterSW` in `App.tsx`. Show a non-blocking toast on GameLibrary only (never mid-game).

### PWA Icons
`public/icons/` is empty. Manifest references `icon-192.png` and `icon-512.png`. PWA install fails silently without them.

**Fix**: Generate icons and commit to `public/icons/`. Minimum: 192×192 and 512×512 PNG.

### Game-Not-Found State
Navigating to `/#/game/unknown-id` shows a blank screen — `game()` returns null, `<Show when={game()}>` hides everything with no feedback.

**Fix**: Add `<Show when={!game.loading && !game()}>` fallback with "Game not found" message and back link.

### Error Boundary for DB Init Failure
If SQLite/OPFS fails to initialize (e.g. storage quota exceeded), `seedsReady` rejects and all `createResource` calls hang silently.

**Fix**: Wrap `seedsReady` rejection in `App.tsx`. Show a user-facing error state with retry option.

### DeepDiveTabs in Stealth Mode
`PreGameDashboard` always shows `strategy_detailed` (prose) in the deep-dive tabs, even in Stealth Mode. Should show `strategy_stealth` bullets when `appMode === 'stealth'`.

### Filter Default State
`InlineYesNoFilter` defaults both toggles to "No". Should default to no selection (unset) — only filter when user explicitly picks Yes or No. Strategies with matching context should be hidden until filter is chosen.

---

## 📋 Nice-to-Have (v1.x)

### More Seed Files
Only Catan is bundled. High-value targets:
- Ticket to Ride
- Pandemic
- Wingspan
- 7 Wonders
- Terraforming Mars

Use the AI ingestion prompt in spec §10.4 to generate.

### Component Tests
Current test coverage on views is 0%. The `@solidjs/testing-library` + in-process SQLite alias makes component tests cheap to write.

Priority files: `ActionAccordion`, `LiveCompanion`, `GameLibrary`.

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

### Keyboard Navigation
ConditionToggle rows are keyboard-accessible (they're `<button>`) but there's no arrow-key navigation between rows. Low priority for mobile-first, but needed for a11y audit.

### Swipe Gesture on PhaseStepper
Spec §5.2 mentions horizontal swipe if a game defines more than 4 phases. Not implemented (current phase enum is fixed at 4). Revisit if a game requires extra phases.

### Search in LiveCompanion
Not in spec but useful for 30+ strategy games. Fuzzy filter on condition text within the current phase accordion.

---

## 🚫 Out of Scope (v2)

Per spec §11 — do not implement in v1:

- **"My Meta" layer** — custom per-condition notes, failure flagging, strategy down-ranking
- **Post-game wrap-up** — win/loss logging, strategy performance tracking, win-rate dashboard

---

**Last Updated**: 2026-05-23
