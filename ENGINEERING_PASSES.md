# Engineering Passes

Reusable autonomous-execution prompts, **adapted to this repo** (`tabletop-strategy-companion`: a SolidJS +
TypeScript + SQLite-Wasm local-first, mobile-first PWA that surfaces glanceable board-game strategy at the
physical table; `npm` / `vitest` / `playwright`, Zod-validated JSON seeds, deployed static to Cloudflare Pages).
Each is a full loop — the agent reviews, implements, verifies through the toolchain, commits, and pushes. Pick a
pass, paste its prompt, let it run.

Repo shape the prompts assume:
- `src/lib/strategy.ts` — the pure logic core (no DOM, no I/O): `PHASE_ORDER`, `filterByContext`,
  `groupByCategory`, `hoistTLDR`, `prepareStrategies`. This is the reactive pipeline that turns raw seed rows
  into the rendered accordion. The highest-value test surface.
- `src/store/appState.ts` — the single `appMode` signal ('study' | 'stealth') + toggle + localStorage + the
  `data-mode` body-attribute sync that drives all theming via CSS variable aliases (no runtime JS theming).
- `src/db/` — the ONLY I/O boundary. `schema.ts` (Zod schemas: GameSeedSchema, StrategySchema, PhaseEnum,
  TagEnum — the seed-validation contract), `sql-schema.ts` (SQL DDL + `ADDITIVE_MIGRATIONS`), `index.ts`
  (`TabletopDB` + query helpers + `dbReady`), `seed.ts` (`import.meta.glob` loader, djb2 version hash,
  skip-if-unchanged UPSERT), `sqlite-table.ts` (`SQLiteTable<T>` ORM), `sqlite.worker.ts` (prod: Worker + OPFS
  SAH pool, 10-retry fallback to in-memory), `sqlite-test-client.ts` (test: in-process, no Worker/OPFS).
  Vitest aliases `/sqlite-client$/ → sqlite-test-client`.
- `src/views/*.tsx` — one page per hash route: GameLibrary (`/#/`), PreGameDashboard (`/#/game/:id`),
  LiveCompanion (`/#/game/:id/play`).
- `src/components/*.tsx` — StickyTopBar, ModeToggle, PhaseStepper, ActionAccordion, ConditionToggle,
  InlineYesNoFilter, GameCard, NetworkIndicator.
- `src/sw.ts` — `injectManifest` service worker; blocks `skipWaiting` while a `SESSION_ACTIVE` message is set
  (so a PWA update can't reload mid-game).
- `data/seeds/*.json` — one JSON file per game (20 shipped), validated against the Zod schema at boot AND in
  CI via `src/db/schema.test.ts` (runs in the node environment, reads the filesystem).
- `src/lib/strategy.test.ts`, `src/db/*.test.ts`, component tests (ActionAccordion, InlineYesNoFilter) —
  co-located Vitest suites run against the real in-process SQLite engine (no DB mocks). Coverage gated ≥80% on
  `lib`/`views`/`store`. `tests/e2e/` holds Playwright specs.
- Design invariants live in `.claude/ARCHITECTURE_MAP.md` § Key Invariants and `.claude/COMMON_MISTAKES.md`;
  the full product spec is at `/home/spark343/github/tabletop-strategy-companion-spec.md`.
- `retro/` — dated strategy/UX validation records (Pass 5): one markdown file per audited game or
  cross-cutting theme (`retro/YYYY-MM-DD-<game-id>.md`), authored from `retro/TEMPLATE.md`. Append-only;
  see `retro/README.md`. This is where Pass 5 writes its analysis and its model/UX recommendations.

## Quick pick

| Pass | Use when |
|------|----------|
| [1. Structural Refactor](#1-structural-refactoring) | Code works but is clever / over-abstracted / hard to follow; maintainability without behavior change. |
| [2. Security Mitigation](#2-security-mitigation) | Concrete, local hardening against this PWA's real threat model — not security theater. |
| [3. High-Signal Testing](#3-high-signal-testing) | Coverage is thin or vanity; you want behavior tests that make refactoring safe. |
| [4. Seed Authoring Loop](#4-seed-authoring-loop) | Add a new game's strategy seed, validate it against the Zod contract, exercise it through the views, document. Repeat to grow the library. |
| [5. Strategy & UX Validation](#5-strategy--ux-validation-retro) | A game already ships — audit whether its strategy is optimal, its prose/delivery is understandable at the table, and the decomposition model fits. Writes a dated retro; ships bounded seed fixes, opens issues for model/UX changes. |

Verification commands referenced by every pass (this repo):

```bash
# Build = typecheck + bundle (tsc -b is the compile/type gate; no separate typecheck script)
npm run build

# Lint
npm run lint

# Unit + component tests + Zod seed validation (Vitest; the seed test runs in the node env, reads data/seeds/)
npm test
npm run test:coverage          # enforces the ≥80% gate on lib/views/store

# E2E (Playwright — needs the dev server or a build; the real Worker+OPFS path)
npm run test:e2e

# Commit + push — Conventional Commits, NO Co-Authored-By trailer (project preference); trunk-based.
git commit -m "..." && git push origin main
# CI (.github/workflows/deploy.yml) runs `npm test` → `npm run build` → a 15 MB bundle-size cap →
# deploys to Cloudflare Pages on a push to main. A pass is done only when the deploy run is green:
gh run watch "$(gh run list -L1 --json databaseId -q '.[0].databaseId')" --exit-status
```

---

## 1. Structural Refactoring

```text
Act as a pragmatic, veteran TypeScript engineer working on tabletop-strategy-companion, a SolidJS + SQLite-Wasm local-first PWA for glanceable board-game strategy. Perform a deep code review of src/lib/strategy.ts, src/store/appState.ts, the views in src/views/, the ActionAccordion/ConditionToggle/PhaseStepper/InlineYesNoFilter components, and the query/seed layer in src/db/ (sqlite-table.ts, seed.ts, index.ts). Your dual mandate is to (1) hunt down and fix hidden bugs, logic errors, and edge-case failures, and (2) immediately implement structural changes that maximize maintainability, testability, and immediate obviousness.

Ruthlessly remove "clever" code, premature abstractions, and over-engineering. Do not change user-visible behavior, the Zod seed schema (it is a data contract — see Pass 4), the SQL schema, or the study/stealth theming model.

Evaluate and modify against these criteria:
1. Correctness & Defensive Execution: Treat every line as a potential failure point. The highest-yield hunting ground is the strategy pipeline and the documented invariants (.claude/ARCHITECTURE_MAP.md § Key Invariants), because a violation here silently shows the wrong strategies in the wrong order at the table. Actively spot: phase ordering that falls back to alphabetical instead of the enum index (Setup 0 → Early Game 1 → Mid-Game 2 → End-Game 3 — COMMON_MISTAKES #1), context filtering (`context === null` means UNIVERSAL/always-visible; a non-null context shows ONLY when in activeContexts — getting that boolean backwards hides universal strategies), TLDR hoist preserving relative order within each tier, category/condition alphabetical ordering applied in the right place in prepareStrategies, and the single-open-accordion invariant (only one ConditionToggle open at a time — two open breaks the stealth single-screen lock, COMMON_MISTAKES #2).
2. Verify before fixing: a suspected bug in framework API usage (Solid reactivity/createMemo, @solidjs/router hash routing, @sqlite.org/sqlite-wasm, the seed import.meta.glob) must be confirmed against the INSTALLED version first — read node_modules or reproduce in a test. Do not add dead defensive code for behavior the library doesn't have.
3. YAGNI: Remove abstractions solving hypothetical future problems. Prefer simple, slightly repetitive code if it lowers cognitive load.
4. Locality of Behavior: Keep related logic together — the filter→group→sort→hoist flow reads as one pipeline; the SW session-lock post/cleanup pair stays together; the data-mode body sync stays with the appMode signal.
5. Explicit data flow: Remove hidden side effects and tight coupling. src/lib/strategy.ts MUST stay pure (plain arrays in, grouped Map out — no DOM, no DB); the ONLY I/O boundary (SQLite Worker + OPFS, seed UPSERT) lives in src/db — keep it there. Theming is data-mode + CSS variables, never runtime JS branching on mode inside components.
6. Structural flattening: Replace deep nesting and complex conditionals with early returns and linear paths.
7. Output / layout discipline: Do not regress the mobile invariants — text must WRAP (text-overflow: ellipsis is BANNED, COMMON_MISTAKES #3), every interactive element keeps a ≥44×44px tap target, and the total app footprint stays under 15 MB (CI enforces this).
8. Test before restructuring: check coverage for the path you're about to refactor (`npm run test:coverage`). If the suite doesn't reach it, first add ≤ 3 targeted tests for its current behavior so the refactor lands verified, not hopeful.

SCOPE GUARDS:
- The Zod seed schema (GameSeedSchema/StrategySchema/PhaseEnum/TagEnum) is a data contract that 20 seed files conform to — changing it is a migration, not a refactor, and is out of scope here (it belongs to Pass 4 / a deliberate schema-change task). Restructure the code that USES it, never the shape itself.
- The phase order, the alphabetical category/condition rules, and the TLDR-hoist rule are product spec (spec §, ARCHITECTURE_MAP § Key Invariants) — reordering them is a BEHAVIOR change, out of scope.
- The study/stealth color tokens and the data-mode mechanism are spec'd — restructure around them, don't replace them with JS theming.

Honor the existing invariants: strategy.ts is pure; one ConditionToggle open at a time; phases sort by enum index never alphabetical; null-context strategies are universal; all text wraps; ≥44px tap targets; <15 MB footprint; the SW must reject skipWaiting while SESSION_ACTIVE.

EXECUTION WORKFLOW (run in order; do not stop until green):
1. Build/typecheck: `npm run build`.
2. Lint: `npm run lint`.
3. Test: `npm test` (includes the Zod seed-validation test). If anything fails, or a bug fix broke an existing assumption, fix your implementation until it passes. Pin a corrected pipeline/invariant bug with a regression test in src/lib/strategy.test.ts. For anything touching the real Worker/OPFS or routing, spot-check with `npm run test:e2e`.
4. Commit with a concise message explaining WHY the bug was fixed or the structural change was made (not what). No Co-Authored-By trailer.
5. Push `git push origin main`, then confirm CI green (`gh run watch ... --exit-status`) — CI runs the tests, the build, and the 15 MB bundle cap before deploying.
```

---

## 2. Security Mitigation

```text
Act as a pragmatic, veteran security architect reviewing tabletop-strategy-companion: a static, client-authoritative local-first PWA (SolidJS + SQLite-Wasm in OPFS) deployed to Cloudflare Pages. There is NO server, NO auth, NO backend, and NO user-supplied data at runtime — the only data is the developer-authored JSON seeds bundled at build time and the user's local strategy DB. The threat model is therefore: XSS = read/write of the local OPFS DB, malformed/oversized seed data breaking the boot path, and supply chain (a tampered dependency or lockfile) as the realistic active threat. Implement concrete, local mitigations strictly for THIS model — no server-side auth, sessions, or rate limiting apply.

Focus your implementation on:
1. Content-Security-Policy: a CSP must exist in public/_headers (Cloudflare) and stay mirrored in the vite.config preview headers (and index.html if present). It must keep `script-src 'self' 'wasm-unsafe-eval'` (SQLite Wasm needs it), `style-src 'self' 'unsafe-inline'` (Tailwind minimum), `worker-src 'self' blob:` (the injectManifest service worker + sqlite worker), plus `object-src 'none'`, `base-uri 'self'`, `form-action 'none'`. Confirm public/_headers also sets X-Content-Type-Options: nosniff and a Referrer-Policy. Do not loosen these; flag any drift between copies.
2. Seed-data trust boundary: the seeds are developer-authored, but they are the one untrusted-shaped input to the boot path — confirm EVERY seed is validated against the Zod schema before it reaches SQLite (src/db/schema.ts + the seed loader), and that a malformed seed fails the build/test (src/db/schema.test.ts) rather than corrupting the DB at runtime. A seed that fails Zod must never be UPSERTed. Keep the strict bounds the schema encodes (game_id kebab 2–32 chars, condition length caps, the PhaseEnum/TagEnum closed sets).
3. SQL identifier hygiene: confirm the SQLiteTable query layer never interpolates a non-literal identifier into the SQL string (table/column names come from code, not from seed content or the user). If there is no `assertIdent`-style guard on the constructor/where/orderBy/column-key paths, add one (`^[A-Za-z_][A-Za-z0-9_]*$`) so a future seed-driven or dynamic call site can't inject an identifier.
4. Service-worker / update safety: the injectManifest SW (src/sw.ts) must keep rejecting `skipWaiting` while SESSION_ACTIVE is set, keep the user-controlled `registerType: 'prompt'` update model, and evict outdated precaches on update so a stale/tampered bundle is replaced. Confirm the .wasm CacheFirst and seed StaleWhileRevalidate routes are bounded (maxEntries) so cache growth is capped.
5. localStorage tampering: appState reads appMode from localStorage — confirm a corrupted/unexpected value falls back safely to a default mode (not an undefined data-mode attribute or a thrown error at boot).
6. Supply chain / deploy: the deploy workflow must stay least-privilege (`permissions: contents: read`, `persist-credentials: false`) and keep `npm audit signatures` so a tampered lockfile is caught before deploy. The 15 MB bundle cap doubles as a tripwire against an unexpected dependency bloat.

Do not add authentication, encryption-at-rest, or a heavy security framework — that contradicts the no-server, single-user, offline model and would be theater. Do not weaken offline-first behavior or the seed-validation contract.

EXECUTION WORKFLOW (run in order; do not stop until green):
1. Build/typecheck: `npm run build`.
2. Lint: `npm run lint`.
3. Test: `npm test`, and add tests for any new/tightened guard (a deliberately-malformed seed rejected by Zod, an identifier-guard rejection, a bad localStorage mode falling back). The seed-validation precedent is src/db/schema.test.ts; the query-layer precedent is src/db/sqlite-table.test.ts. Do not compromise core functionality for security theater.
4. Commit: the message must state the EXACT vulnerability mitigated and the method used. No Co-Authored-By trailer.
5. Push `git push origin main`, then confirm CI green (`gh run watch ... --exit-status`).
```

---

## 3. High-Signal Testing

```text
Act as a pragmatic, veteran TypeScript engineer extending the tabletop-strategy-companion test suite (Vitest + @solidjs/testing-library + in-process @sqlite.org/sqlite-wasm). Write tests optimized for high confidence, safe refactoring, and zero maintenance burden. No vanity/coverage-chasing tests; do not test SolidJS, @solidjs/router, or the SQLite engine themselves — pin OUR usage of them, not their behavior. The suite is currently thin (~24 tests) — the goal is to make the pipeline and invariants refactor-safe, not to hit a number.

Route each test to the layer that owns it:
- src/lib/strategy.test.ts — the pure pipeline (the highest-value target). filterByContext, groupByCategory, hoistTLDR, prepareStrategies, PHASE_ORDER. No DOM, no DB, no mocks — feed arrays, assert the grouped/ordered result.
- src/db/*.test.ts — schema.test.ts validates EVERY data/seeds/*.json against Zod (node env, real filesystem); sqlite-table.test.ts / tabletop-db.test.ts / seed.test.ts exercise the ORM, query helpers, and the djb2 skip-if-unchanged seed loader against the real in-process engine.
- component tests (e.g. ActionAccordion.test.tsx, InlineYesNoFilter.test.tsx) — render the component and drive it from DOM events; assert the rendered tree and the invariants (single-open accordion, filter context toggle).
- views (GameLibrary, PreGameDashboard, LiveCompanion) — end-to-end from route → seedsReady → DB → rendered output, no DB layer mocked.

Enforce these principles:
1. Test behavior, not implementation: call the public functions/components as a consumer would and assert on OUTPUTS — the grouped Map (keys in alphabetical order, values TLDR-hoisted), rendered condition text, the open/closed accordion state, the filtered strategy set. Don't assert on internal call sequencing.
2. Real instances over mocks: build real Strategy[] fixtures for the pure layer; build real DB state via the in-process test client for the DB/view layers. The engine in tests IS production (only the Worker/OPFS transport differs) — nothing to mock.
3. High-signal targeting — pin the documented invariants, because they are exactly what a refactor can silently break:
   - phase sort is enum-index (Setup 0 → Early Game 1 → Mid-Game 2 → End-Game 3), NEVER alphabetical — assert a fixture whose alphabetical order differs from phase order.
   - context filter: a null-context strategy is ALWAYS visible; a non-null context shows ONLY when active — assert both directions and the "context not active → hidden" case.
   - TLDR strategies hoist to the top of their category group, relative order preserved within each tier.
   - category keys alphabetical; condition order alphabetical within a category (after TLDR hoist).
   - single ConditionToggle open at a time — opening a second closes the first.
   - the seed loader UPSERTs only when the djb2 hash changes (skip-if-unchanged).
   Pick targets from evidence: `npm run test:coverage` prints per-file missing lines/branches — chase uncovered BRANCHES that encode a decision (the null-context guard, the phase-index lookup, the hoist partition), not trivial passthroughs.
4. Clean state hygiene: guarantee isolation — reset the in-process DB between tests; reset the appMode signal / localStorage between mode-toggle tests; render with a fresh component tree per case.
5. Defensive boundaries: empty strategy list, a category with no TLDR, a strategy whose phase isn't in PHASE_ORDER, a game with no strategies (PreGameDashboard "game not found" / empty state), a seed that fails Zod (schema.test.ts must REJECT it, not skip it). Assert a safe/empty render, never a crash.
6. Assert meaning, not prose: pin ordering, group membership, visibility booleans, and rendered condition text — not incidental class names or copy that's allowed to be reworded.

Match the existing files' style (Vitest, describe/it, synthetic Strategy fixtures built in-test, @solidjs/testing-library render+events — reuse the existing fixtures instead of inventing new ones; never seed tests from anything but synthetic data).

EXECUTION WORKFLOW (run in order; do not stop until green):
1. Build/typecheck: `npm run build`.
2. Lint: `npm run lint`.
3. Test: `npm test`. If new tests fail or break existing ones, debug and fix the TEST — unless you uncovered a real bug in strategy.ts / the DB layer / a view, in which case fix the source and note it in the commit. Confirm the coverage gate still holds with `npm run test:coverage`.
4. Commit with a concise message describing the BEHAVIOR now covered. No Co-Authored-By trailer.
5. Push `git push origin main`, then confirm CI green (`gh run watch ... --exit-status`).
```

---

## 4. Seed Authoring Loop

This pass is designed to be run repeatedly. Each run adds ONE new game's strategy seed, proves it conforms to the
Zod contract, exercises it through the live views, and documents anything that broke. Over time this grows the game
library (ROADMAP.md lists high-value targets) while surfacing schema/tooling gaps the same way the chess-mcp
analysis loop does for its MCP.

```text
Act as a board-game strategist and TypeScript engineer working on tabletop-strategy-companion. Add ONE new game seed under data/seeds/, validate it against the Zod contract, exercise it through the app, and ship. The goal is iterative library growth: each run adds a game and surfaces any schema/tooling shortcoming the new game exposes.

Set <game-id> to a kebab-case id, 2–32 chars (e.g. `azul`, `wingspan`, `power-grid`). Pick a game NOT already in data/seeds/ (20 ship today — check the directory first). High-value targets are listed in ROADMAP.md § More Seed Files.

CONTEXT
- A seed is a single JSON file `data/seeds/<game-id>.json` conforming to GameSeedSchema/StrategySchema in src/db/schema.ts. The Zod schema is the authoritative contract — read it before authoring, don't guess field names.
- Bounds the schema enforces (verify against the actual schema, these are the shape): game_id kebab-case 2–32 chars; each strategy has a phase from PhaseEnum (Setup / Early Game / Mid-Game / End-Game), a category, a condition string (length-capped, ~5–45 chars), a strategy body, optional stealth body, tags from TagEnum (including TLDR), and an optional context that matches one of the game's `filter_N_yes/no_context` strings (null context = universally visible — COMMON_MISTAKES #4).
- Seeds are loaded by import.meta.glob at build time and UPSERTed by djb2 version hash at boot; the full set is Zod-validated in CI via src/db/schema.test.ts.
- The product spec (/home/spark343/github/tabletop-strategy-companion-spec.md, §10) has the canonical seed format and an AI-ingestion prompt — follow it.

PHASE 1 — AUTHOR THE SEED
1. Confirm <game-id> is not already present in data/seeds/.
2. Read src/db/schema.ts (the Zod schemas) and one existing seed (data/seeds/catan.json is the reference — 16 strategies, all 4 phases, leading/trailing context filter) to match structure exactly.
3. Author data/seeds/<game-id>.json: real, glanceable strategic advice for the game, organized by phase and category. Cover all 4 phases where the game has meaningful phase-specific play. Mark the 1–3 most important per-phase strategies with the TLDR tag (they hoist to the top). Write a stealth-mode body for each where it helps (terser, table-glanceable). If the game has a leading/trailing or similar binary state, wire a context filter and set the matching strategies' context; leave universal strategies' context null. Keep every condition string within the length cap and ensure all text is glanceable — no walls of prose (text wraps, ellipsis is banned, so long conditions just take vertical space).

PHASE 2 — VALIDATE
1. `npm test` — src/db/schema.test.ts validates the new seed against Zod automatically. If it fails, fix the seed until the schema passes. Do NOT relax the schema to fit the seed — the schema is the contract; a seed that can't conform is the seed's problem (unless Phase 4 finds a genuine schema gap).
2. `npm run build` — confirm the bundle still builds and stays under the 15 MB cap.

PHASE 3 — EXERCISE IT
Run the app (`npm run dev`, or `npm run test:e2e` against the new game) and walk the real flow for <game-id>:
- GameLibrary: the new game appears and is findable via search.
- PreGameDashboard: TLDR strategies surface; the deep-dive tabs render; stealth bodies appear in stealth mode.
- LiveCompanion: phase stepper walks Setup → Early → Mid → End in order (never alphabetical); category groups are alphabetical; TLDR hoisted; the context filter (if any) shows/hides the right strategies; only one ConditionToggle opens at a time.
Note anything that renders wrong, sorts wrong, overflows, or required the schema to bend.

PHASE 4 — CAPTURE TOOLING GAPS (only if found)
The seed CONTENT is a content task, not a finding. But if authoring/exercising this game exposed a SCHEMA or TOOLING shortcoming — a strategy shape the schema can't express, a context-filter model that doesn't fit this game, a phase the enum lacks, a length cap that's too tight for a real condition, a view that mis-renders a valid seed — record it. Classify:

IMPLEMENT NOW (all true): engine-free, ≤ 2 files, the existing test suite covers it or you can add ≤ 5 tests, no breaking change to the seed contract that invalidates the 20 existing seeds.
OPEN ISSUE ONLY (any true): a schema change that would require migrating existing seeds, a new view/component, a change needing the real Worker/OPFS to verify, or a design-doc-worthy data-model decision. `gh issue create` with problem / proposed fix / acceptance criteria; check `gh issue list` first to avoid duplicates.

PHASE 5 — VERIFY AND SHIP
Run in order; do not proceed past a failure:
1. `npm run build` (typecheck + bundle + implicit 15 MB headroom).
2. `npm run lint`.
3. `npm test` — the Zod seed-validation test must pass with the new seed included.
4. Commit: a single commit adding the seed (+ any bounded Phase-4 fix), message of the form `feat: add <game-id> strategy seed` (or leading with the fix if one landed). No Co-Authored-By trailer.
5. Push `git push origin main`, then confirm CI green (`gh run watch ... --exit-status`) — CI re-validates all seeds, builds, and enforces the bundle cap before deploy. On next app load the djb2 hash mismatch UPSERTs the new game.

GUARDRAILS
- Never relax the Zod schema just to make a seed validate — fix the seed, or open a Phase-4 issue if the schema genuinely can't express valid content.
- Never break the 20 existing seeds: any schema change must keep them all passing schema.test.ts.
- One game per run keeps the diff reviewable and the content focused — resist adding two.
- Author real strategy, not filler — a seed of generic advice is worse than no seed. If you don't know the game well enough to give glanceable, phase-specific guidance, pick a different <game-id>.
```

---

## 5. Strategy & UX Validation (Retro)

This pass AUDITS strategy content that already ships — it does not author new games (that is Pass 4). Each
run takes ONE game (or ONE cross-cutting theme) and answers three independent questions: is the strategy
optimal, does the delivery make it understandable at the table, and is the decomposition model the right fit
for this game. The deliverable is a dated retro in `retro/`; bounded in-seed fixes ship in the same PR, while
model/UX changes are written up and opened as issues. Run it repeatedly to keep the shipped library honest.

```text
Act as a board-game strategist AND a product/UX writer working on tabletop-strategy-companion, a SolidJS + SQLite-Wasm local-first PWA that surfaces glanceable board-game strategy at the physical table. Your job is to VALIDATE the strategy content of ONE game that already ships in data/seeds/ — not to author a new one (that is Pass 4). Set <game-id> to a seed that exists in data/seeds/ (20 ship today). Alternatively, set the scope to ONE cross-cutting theme across all seeds (e.g. "stealth-mode glanceability", "context-filter fit", "TLDR-selection quality") — pick the single most valuable target and go deep; do not audit two games in one run.

The deliverable is a dated retro at retro/YYYY-MM-DD-<game-id>.md (or retro/YYYY-MM-DD-<scope>.md), following retro/TEMPLATE.md. Read retro/README.md first for the format and the Shipped-vs-Recommended split.

THE MODEL YOU ARE VALIDATING (read the code, don't trust this summary blindly):
- A seed decomposes a game as Phase -> Category -> Condition -> Strategy (src/db/schema.ts is the contract). `condition` (5-45 chars) is the board-matchable TRIGGER; `category` (3-24 chars) is its bucket within a phase; `phase` is one of the game's declared `phases`. Each strategy also has optional `order` (int>=0, default 0) that sets reading sequence within a phase; each game has `nav_style` ('arc' | 'modes', default 'arc') controlling how the phases render (see Axis C).
- Every strategy carries TWO delivery registers: `strategy_detailed` (study mode, 20-300 chars of prose) and `strategy_stealth` (stealth mode, an array of <=3 lines, each <=50 chars). Same advice, two registers.
- `tags` (<=2, from TagEnum): TLDR hoists to the top of its category group AND drives the stealth collapse (below). The other 8 (Offense/Defense/Economy/Pivot/Memory/Bluff/Transition/Closing) now render as inline badges (`TagBadges`) on each condition — a wrong or missing tag is a player-visible bug, not just metadata. Each strategy should carry the kind of move it is.
- `context` (nullable) ties a strategy to a binary filter: filter_1/filter_2 each define a yes/no context (Catan: leading/trailing). context=null = universally visible; a non-null context shows ONLY when that filter side is active. Two filters max per game.

HOW IT IS DELIVERED (read src/views/PreGameDashboard.tsx, src/views/LiveCompanion.tsx, src/components/ActionAccordion.tsx, src/lib/strategy.ts):
- PreGameDashboard (/#/game/:id) — the prep surface. A "Key Strategies" TLDR list (study shows `strategy_detailed`; stealth shows ONLY `strategy_stealth[0]` — the first line carries everything), then Deep-Dive phase tabs showing every strategy for the active tab.
- LiveCompanion (/#/game/:id/play) — the at-table surface. PhaseStepper + the binary InlineYesNoFilter + a search box + the ActionAccordion (exclusive expansion: one ConditionToggle open at a time). STEALTH one-screen model: each phase COLLAPSES to its TLDR strategies by default (a phase with no TLDR falls back to showing all); a "show all (N)" toggle reveals the rest and switches `<main>` to scroll. The collapsed default stays `overflow-hidden` and must fit one screen — enforced by a <=8 collapsed-row budget (category headers + condition rows) in `schema.test`. A dense phase earns its place via a TLDR (which collapses it) or by being small.
- prepareStrategies (src/lib/strategy.ts): within a category, strategies sort by `order` (asc) then condition ALPHABETICALLY; categories sort by their smallest member `order` then alphabetically; then TLDR hoists to the top of each category. A seed that sets no `order` (default 0) collapses to the old pure-alphabetical behavior. So a scrambled reading order is FIXED IN-SEED by setting `order` (a content fix, in scope) — no code change needed.
- The search box filters on `condition` text ONLY — body text is not searchable. A trigger the player would search for must live in the condition.

EVALUATE ALONG THREE INDEPENDENT AXES (a game can ace one and fail another — score them separately):

AXIS A — STRATEGIC OPTIMALITY. Is each strategy the strongest, most current line for its condition?
- Correctness: rules, numbers, probabilities (e.g. Catan pip counts), named bonuses. A confidently-wrong number is the worst failure — it actively misleads at the table.
- Optimality: the established competitive line, not folk wisdom or stale meta. Where it matters, ground the claim in the known consensus and say so in the retro.
- Fit: is the advice filed under the phase/category/condition where the player actually faces that decision? Does context advice (leading vs trailing) point the right way?
- Coverage: is a dominant, table-defining strategy MISSING for a phase the game clearly has?

AXIS B — PROSE & DELIVERY (the UX of comprehension). Optimal advice the player can't parse fast is wasted.
- `condition`: a precise trigger the player matches to the live board in under ~2s, or vague / overlapping with a sibling condition? Is it searchable (the term they'd actually type)?
- `strategy_detailed`: a crisp paragraph that LEADS with the action, or a wall that buries the verb? Within register? Jargon/acronyms expanded on first use? Reading level fit for a glance, not a textbook.
- `strategy_stealth`: does each of the <=3 lines STAND ALONE and survive a half-second glance? Does the set degrade gracefully — especially the dashboard TLDR list, which shows ONLY line 0, so line 0 must carry the headline? Does the open toggle stay within the one-screen budget?
- Register parity: do detailed and stealth say the SAME thing? A stealth line that omits or contradicts the detailed advice is a bug.
- Aggregate density: does each phase's COLLAPSED (TLDR-only) view fit the <=8-row stealth budget? A large phase with no TLDR falls back to showing all and can overflow — give it a TLDR or split it.

AXIS C — MODEL FIT. Is Phase -> Category -> Condition -> Strategy (+ two registers, binary filters, the tag vocab) the right way to break THIS game down — or is the game forced into a shape that hides its real decision structure?
- Phases (PHASE-FIT TEST): for EVERY declared phase/mode, name the decision the player makes WHILE IN IT. A phase that holds no actionable decision — an orphan bucket for leftover strategies, a mislabeled phase, or a trivial/random Setup — must be dissolved: fold its strategies where they belong and drop the phase (a content fix, in scope). Worked examples: battleship's old "Defense" mode (Battleship has no in-game defense) and guess-who's "Setup" (the card is dealt randomly — nothing to choose) were both dropped. Then check `nav_style`: use `modes` ONLY when the game OSCILLATES between states reachable on any turn (battleship: search↔target); if progress is MONOTONIC — you only move forward and can't return to an earlier state (deduction/elimination games like clue, guess-who) — it's an `arc`, even if the stages are soft. Re-modeling `arc`↔`modes` is RECOMMEND-ONLY (engine change). See COMMON_MISTAKES #8.
- Categories: meaningful and roughly MECE, or arbitrary? Does alphabetical category order ever mislead?
- Conditions: do they partition the decision space cleanly, or overlap / leave gaps? Does alphabetical condition order scatter a sequence the player reads in order?
- Context filters: does the binary yes/no model fit the game's real branching state (leading/trailing, your-turn/not, key-resource present/absent), or is it forced — or absent where the game badly needs one? Does the game want MORE than two filters?
- Tags: tags render as badges now, so check they're CORRECT and useful — is each strategy tagged with the kind of move it actually is (Offense/Defense/Economy/…)? A wrong or missing non-TLDR tag is a visible glanceable bug, fixable in-seed.

CLASSIFY EVERY FINDING — this controls what you change vs. what you only recommend:
- SHIP IN THIS PASS (all true): the fix lives ENTIRELY inside the seed's content — a wrong number, a rewritten/retightened body, an over-long or non-standalone stealth line, a mis-tagged or missing TLDR, a wrong/missing non-TLDR tag, a vague condition, a context value pointing the wrong way, a reading-order fix via the `order` field, or dissolving a non-actionable phase (fold its strategies elsewhere, drop it from `phases`). It does not change the schema, the sort LOGIC, the filter model, the `nav_style` engine, or any component. It stays within every Zod bound (game_id, the 45/24/300/50-char caps, <=3 stealth lines, <=2 tags, `order` int>=0, the closed PhaseEnum/TagEnum) AND the <=8 collapsed-row stealth budget. The Zod test + the budget test + a view spot-check verify it.
- RECOMMEND ONLY — write up in the retro and open a GitHub issue (problem / proposal / acceptance criteria; `gh issue list` first to avoid dupes): anything that changes the MODEL or ENGINE — a schema field or bound, the sort LOGIC, the binary context-filter shape, re-modeling a game between `nav_style` 'arc' and 'modes', a new view/component, or a per-mode stealth-collapse refinement. These are behavior/contract changes (Pass 1 and Pass 4 scope guards apply) — do not implement them here. NOTE: the platform gaps the early battleship audit raised — tag rendering, the `order` field, `nav_style` modes, the stealth row budget — have ALL shipped; do not re-file them.

SCOPE GUARDS:
- Do NOT relax or extend the Zod schema, change the sort LOGIC, the `nav_style` engine, or the context-filter model in this pass. Those are the model — RECOMMEND-ONLY findings, not pass work. (Schema changes belong to a deliberate migration; the 20 existing seeds must keep validating.) You MAY, in-seed: set `order` to fix reading sequence, correct tags, and dissolve a non-actionable phase — those are content, not model.
- Do NOT rewrite advice you merely disagree with stylistically — change content only where it is wrong, misleading, outdated, or fails the glanceability bar. Preserve the author's correct calls.
- One game (or one theme) per run. Resist auditing a second — depth over breadth; the retro is only valuable if it is deep.
- The retro is ALWAYS written, even if zero fixes ship — the analysis and the recommendations ARE the deliverable.

EXECUTION WORKFLOW (run in order; do not stop until green):
1. Read the model + delivery code listed above and the seed under audit. Run the app (`npm run dev`) or `npm run test:e2e` and walk the real flow in BOTH modes: GameLibrary -> PreGameDashboard (TLDR list + every deep-dive tab) -> LiveCompanion (step every phase, toggle every filter, open conditions, exercise the stealth TLDR-collapse + "show all"). Check each phase's collapsed view fits, `order` gives the right reading sequence, and tags read correctly. The retro must reflect the RENDERED reality, not just the JSON.
2. Write retro/YYYY-MM-DD-<game-id>.md from retro/TEMPLATE.md: fill all three axes with concrete, located findings (phase > category > condition), score each axis, and split findings into Shipped vs Recommended.
3. Apply the SHIP-IN-THIS-PASS fixes to data/seeds/<game-id>.json. For each RECOMMEND-ONLY finding, `gh issue create` and record the number in the retro.
4. Verify: `npm test` (Zod re-validates the edited seed — a fix that breaks a bound fails here), `npm run build` (bundle + 15 MB cap), `npm run lint`. If a seed edit fails Zod, fix the edit to fit the bound — never relax the schema.
5. Commit the retro + any seed fixes + issue references in one commit. Message `docs(retro): validate <game-id> strategy + UX` (or lead with `fix(<game-id>):` if the seed fixes are the headline). No Co-Authored-By trailer.
6. Push `git push origin main`, then confirm CI green (`gh run watch ... --exit-status`) — CI re-validates all seeds, builds, and enforces the bundle cap.

GUARDRAILS:
- Never ship a strategy you cannot stand behind as correct — when unsure of the optimal line, say so in the retro and open an issue rather than guessing into the seed.
- Never relax a Zod bound to fit a reworded body — tighten the body to fit the bound (that constraint IS the glanceability discipline).
- Keep retros append-only — supersede an old one with a new dated file, do not rewrite history.
- A seed fix must improve correctness or comprehension, not just churn prose — if you cannot name which axis it serves, do not make it.
```
