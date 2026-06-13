# Retro — Codenames (`codenames`)

- **Date**: 2026-06-13
- **Scope**: single game
- **Reviewer**: Pass 5 (Strategy & UX Validation)
- **Seed reviewed at commit**: current (pre-fix baseline)
- **Modes exercised**: study ✅ / stealth ✅ — walked analytically (rendered order, line budgets, collapsed-row counts computed from prepareStrategies pipeline; browser/E2E path blocked per memory)

## Verdict

| Axis | Score (1–5) | One-line |
|------|:-----------:|----------|
| A — Strategic optimality | **4** | Strategically sound across all phases; all advice is correct and current. |
| B — Prose & delivery | **4** | Crisp, action-leading bodies; conditions precise; stealth lines stand alone. |
| C — Model fit | **4** | Phases, categories, conditions partition cleanly; spymaster/operative filter is the right primary branching; two known platform gaps (sorting, tag rendering) don't bind codenames-specific. |

> The axes are independent — codenames is delivered cleanly within the current platform constraints. The game's fundamentally role-based structure (spymaster ↔ operative) maps cleanly to the binary filter model.

---

## Axis A — Strategic optimality

The seed covers the game's real decision points clearly: spymaster board mapping → clue design → operative guessing → endgame discipline. All advice is grounded in the established Codenames meta and competitive play.

| # | phase ▸ category ▸ condition | Finding | Severity | Disposition |
|---|------------------------------|---------|:--------:|-------------|
| A1 | Setup ▸ Board Analysis ▸ Spymaster reading the board | Core spymaster first step; establish clusters and flag danger zones. Correct. | 🟢 | Accept |
| A2 | Setup ▸ Clue Safety ▸ First clue of the game | Conservative opener (2–3 clear cards) establishes team trust; correct approach. | 🟢 | Accept |
| A3 | Early Game ▸ Operative Guessing ▸ Parsing a multi-word clue | Obvious-first heuristic is the safe, proven operative line. Correct. | 🟢 | Accept |
| A4 | Early Game ▸ Clue Strategy ▸ Risky card near assassin | Never bundling a dangerous card with safe ones; isolate and give unique angle. Correct defense. | 🟢 | Accept |
| A5 | Early Game ▸ Operative Guessing ▸ Unsure about a guess | "Prefer literal over popular meaning" — a useful tiebreaker but context-dependent (popular-culture clues ARE intentional). Heuristic, not law; acceptable. | 🟡 | Accept |
| A6 | Mid-Game ▸ Clue Strategy ▸ Opponent one card from winning | Speed beats elegance under time pressure; correct decision. | 🟢 | Accept |
| A7 | Mid-Game ▸ Operative Guessing ▸ Leftover guess from previous turn | Leftover guess from prior clue is nearly always valid; correct. | 🟢 | Accept |
| A8 | Mid-Game ▸ Clue Strategy ▸ Team missed cards from prior clues | '0' clue grants unlimited guesses and redirects to missed cards; information leak is a real tradeoff. Correct. | 🟢 | Accept |
| A9 | Mid-Game ▸ Clue Strategy ▸ Team is misinterpreting your clues | Simplify after consecutive misses to rebuild trust; sound tactical pivot. | 🟢 | Accept |
| A10 | End-Game ▸ Clue Strategy ▸ One card left to guess | Hyper-specific, unambiguous final clues; correct endgame discipline. | 🟢 | Accept |
| A11 | End-Game ▸ Operative Guessing ▸ One card left, must guess correctly | Enumerate, eliminate danger, pick semantically closest; correct final discipline. | 🟢 | Accept |

**No dominant strategies missing.** TLDR distribution (Setup 1, Early 1, Mid 0, End 1) is defensible — Mid-Game TLDRs are all situational (speed vs. elegance, team communication, redirects), not universals like S1 (always map) or S3 (always guess obvious).

---

## Axis B — Prose & delivery (the UX of comprehension)

All conditions are ≤45 chars (max 38); all `strategy_detailed` ≤300 (max 146); all `strategy_stealth` lines ≤50 (max 38); all stealth arrays ≤3 lines.

| # | location | Finding | Severity | Disposition |
|---|----------|---------|:--------:|-------------|
| B1 | Setup ▸ Clue Safety ▸ First clue of the game, stealth line 2 | "Backfire on opener often loses" — contextless. The body clarifies it means "risky high-number opener that fails," but standing alone (if toggled open) the term "backfire" is vague. Not TLDR, so low impact. | 🟡 | Accept — context-dependent warning acceptable for non-TLDR; could be "Bad openers hurt momentum" but not broken. |
| B2 | All phases, collapsed view density | Stealth collapse: Setup 2 rows ✓, Early Game 2 rows ✓ (TLDR only), Mid-Game 6 rows ✓, End-Game 2 rows ✓ (TLDR only). All ≤8. | 🟢 | Accept |
| B3 | PreGameDashboard TLDR list | 4 TLDRs: "Spymaster reading…", "Parsing a multi-word…", "One card left to…" — all clear headlines. Line 0 of each stealth carries the headline. | 🟢 | Accept |
| B4 | Early Game ▸ Operative Guessing, alphabetical order | "Parsing a multi-word clue" (TLDR, hoisted) then "Unsure about a guess" — order is TLDR-correct. | 🟢 | Accept |
| B5 | LiveCompanion reading order within "Clue Strategy" (Mid-Game) | Alphabetically: "Opponent one card from winning" → "Team is misinterpreting…" → "Team missed cards…" Ideal sequence (by dependency/gameplay) is team-broken → redirect → opponent-pressure, but alphabetical scatters. Known Issue #6 (alphabetical sort); not codenames-specific. | 🟡 | Recommended-only — model issue #6 |

**All prose is crisp and action-leading.** Dashboard TLDR headlines are clear. Stealth line 0s survive the half-second glance. No register parity issues (detailed ↔ stealth say the same thing).

---

## Axis C — Model fit

Codenames is a fundamentally role-based game: spymasters design clues; operatives guess. The linear `Phase → Category → Condition → Strategy` model with a spymaster/operative binary filter fits cleanly.

| # | model element | Finding | Disposition |
|---|---------------|---------|-------------|
| C1 | Phases | Setup (board mapping, opening philosophy) → Early (operative learning, spymaster defense) → Mid (in-game decisions for both) → End (final-card discipline). All 4 phases are non-empty and semantically distinct. | Accept |
| C2 | Categories | "Board Analysis", "Clue Safety" (Setup); "Operative Guessing", "Clue Strategy" repeating across Early/Mid/End. MECE enough; repeating across phases is appropriate (operative guessing happens in every phase; same for spymaster strategy). Alphabetical category sort within a phase is deterministic. | Accept |
| C3 | Conditions | Within categories, conditions partition decision points: "First clue" vs. "Risky card" (Early); "Opponent close" vs. "Team confused" vs. "Missed cards" (Mid). Clear branching, no overlap. Alphabetical condition order within a category can scatter ideal reading sequence (Mid-Game "Clue Strategy"), but this is Issue #6 (known platform gap), not codenames-specific. | Recommended-only — model issue #6 |
| C4 | Context filter (spymaster / operative) | Filter 1 ("Are you the Spymaster?") is the primary game branching. Coverage: 7/11 strategies spymaster-only, 4/11 operative-only, 0 universal. No secondary persistent binary state (unlike Battleship's "active unsolved hit" or Catan's "leading/trailing") would map cleanly to filter_2. Filter model is correct for this game. | Accept |
| C5 | Tags | 8 non-TLDR tags authored (Offense, Defense, Economy, Pivot, Memory, Closing, Bluff, Transition); none rendered. Codenames uses Defense (defensive isolation), Economy (resource/pacing), Memory (recall/discussion), Offense (speed-to-win), Pivot (simplify/redirect), Closing (endgame). Would Offense/Defense surfacing help glance "my shots" vs. "my placement"? Possibly, but Issue #5 (render non-TLDR tags) is a cross-cutting platform gap, not codenames-specific. | Recommended-only — model issue #5 |
| C6 | Density under platform constraints | All phases fit within stealth collapse budget (≤8 rows). Open toggles do not risk clipping under `overflow-hidden`. Model handles the game well. | Accept |

**No model misfits specific to codenames.** The game's binary role structure maps cleanly to the filter; the linear phase model covers the game's temporal arc (prep → play → endgame); the category/condition tree partitions decisions cleanly. Two known platform gaps (Issue #6: alphabetical sort, Issue #5: tag rendering) don't bind codenames; they're cross-cutting.

---

## Shipped this pass

No bounded, in-seed content fixes identified.

- [x] All 11 strategies are strategically sound, correctly categorized, and delivered clearly.
- [x] All Zod bounds respected (game_id, phase, category 3–24, condition 5–45, strategy_detailed 20–300, stealth lines ≤50, ≤3 per strategy, ≤2 tags, context in {spymaster, operative, null}).
- [x] Stealth collapse budget satisfied (all phases ≤8 rows).
- [x] TLDR distribution defensible (headline per phase where applicable).
- [x] Dashboard TLDR list clear and glanceable.

**No changes to seed.**

## Recommended (not shipped — model/UX changes)

All model-scoped findings are already captured in open issues. Do not refile.

- [x] **[#6](https://github.com/Azeajr/tabletop-strategy-companion/issues/6)** — Alphabetical sort scrambles authored reading order. Codenames "Clue Strategy" in Mid-Game would benefit from `order` field or a richer sort model. (Cross-cutting; not codenames-specific.)
- [x] **[#5](https://github.com/Azeajr/tabletop-strategy-companion/issues/5)** — Render non-TLDR tags. Codenames uses Defense/Offense/Economy/Memory/Pivot/Closing; surfacing them would add a glance-able dimension. (Cross-cutting; not codenames-specific.)

## Notes

- Codenames is a strongest-fit for the current platform model. Its binary role structure (spymaster ↔ operative) maps cleanly to the filter; its temporal arc (setup → play → endgame) maps to phases; its decision branching (team vs. opponent pressure vs. communication) maps to categories/conditions.
- The strategy advice is strategically sound and competitively grounded. No weak or misleading content.
- The game has no universal strategies (every strategy is role-specific), which is unusual but appropriate — spymasters and operatives face entirely different problems. This is not a model mismatch; it's a characteristic of the game.
- Next reviewer: codenames is ship-ready. If Issue #6 (alphabetical sort) lands and allows explicit `order` values, a follow-up pass could sequence "Clue Strategy" as (1) team-communication pivot, (2) redirect, (3) opponent-pressure — but the current alphabetical order is not wrong, just non-ideal.
