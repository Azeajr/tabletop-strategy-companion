# Retro — Unstable Unicorns (`unstable-unicorns`)

- **Date**: 2026-06-13
- **Scope**: single game
- **Reviewer**: Pass 5 (Strategy & UX Validation)
- **Seed reviewed at commit**: `cd99010`
- **Modes exercised**: study ✅ / stealth ✅ — walked analytically (prepareStrategies order, stealth row budgets, condition clarity; browser/E2E blocked in this env per memory)

## Verdict

| Axis | Score (1–5) | One-line |
|------|:-----------:|----------|
| A — Strategic optimality | 4 | Table dynamics + card economy correct; one factual error in Slowdown duration + minor phrase confusion. |
| B — Prose & delivery | 4 | Conditions clear, stealth lines standalone; no scramble or overflow; two lines clarified for precision. |
| C — Model fit | 4 | Arc model fits well enough; single filter captures leading/trailing split; no phase gaps or category overlap. |

> All three axes ship-grade with bounded fixes. Game is strategically sound and well-delivered.

---

## Axis A — Strategic optimality

The advice is established meta: Neigh timings (block Lasso/Destroy, not basic plays), table focus (target leader, not weakest), engine play (upgrades compound), endgame protection (save Super Neigh for win attempt). Pile-on dynamics are correct.

**Finding A1**: "Downgrade Usage" condition falsely claims **"a Slowdown that lasts 3 turns effectively removes 3 of their actions"**. Slowdown is a 1-turn effect that blocks Magic plays; it does not persist 3 turns. Factual error.

| # | phase ▸ category ▸ condition | Finding | Severity | Disposition |
|---|------------------------------|---------|:--------:|-------------|
| A1 | Mid-Game ▸ Downgrade Usage ▸ Targeting opponent with downgrade | Slowdown duration wrong: "lasts 3 turns" → actually 1-turn effect. Detailed + stealth line 3. | 🔴 | **Shipped** — corrected to "Slowdown locks one full turn of plays" (accurate, ≤50 chars). |

## Axis B — Prose & delivery (the UX of comprehension)

All conditions ≤45 chars, clear triggers. Stealth lines standalone and within ≤50-char bounds. No reading-order scramble (alphabetical within each category is natural). TLDR headlines strong ("Clear defenses, then play your 7th"; "Keep Neighs and destructive Magic"). One stealth line phrasing needed tightening for clarity.

| # | location | Finding | Severity | Disposition |
|---|----------|---------|:--------:|-------------|
| B1 | Early Game ▸ Target Selection ▸ (trailing context), stealth line 3 | "Weak eliminated = more threats hit leader" is confusingly phrased; sounds like eliminating the weak player *causes* the leader to be targeted more, when the intent is "keeping weak players alive means they absorb attacks too". | 🟡 | **Shipped** — reworded to "Weak players alive = leader targeted more" (clearer, same advice). |

## Axis C — Model fit

Unstable Unicorns is a multi-player hand-management + table-politics game. The Phase → Category → Condition model fits reasonably: Setup (hand eval) → Early Game (table focus) → Mid-Game (engine building) → End-Game (final push) maps to the actual game progression. Single filter (leading/trailing) captures the primary strategic branch. No phase gaps, no category overlap, no forced splits.

| # | model element | Finding | Disposition |
|---|---------------|---------|-------------|
| C1 | Phases | Setup, Early, Mid, End-Game map cleanly to hand-construction → table-focus → engine-building → climax. Linear arc fits. | ✓ Accept |
| C2 | Filter | One filter "Leading on unicorn count?" correctly branches leading-player protection vs. trailing-player focus. Captures the primary strategic split. | ✓ Accept |
| C3 | Categories & order | No MECE gaps; alphabetical order within each phase is natural and does not scramble a reading sequence. | ✓ Accept |
| C4 | Density | Setup = 3 rows, Early Game = 4 rows (collapsed TLDR), Mid-Game = 6 rows (no TLDR, show all), End-Game = 3 rows. All ≤8 rows; stealth one-screen fit ✓. | ✓ Accept |

---

## Shipped this pass

In-seed content fixes within all Zod bounds; verified `npm test` green (5/5 schema.test.ts pass).

- [x] `unstable-unicorns.json` — **A1**: fixed "Downgrade Usage" detailed + stealth line 3 — Slowdown is 1-turn, not 3-turn; reworded "locks one full turn of plays" (was "lasts 3 turns").
- [x] `unstable-unicorns.json` — **B1**: tightened "Target Selection" stealth line 3 for clarity — "Weak players alive = leader targeted more" (was "Weak eliminated = more threats hit leader").

## Recommended (not shipped — model/UX changes)

None. All findings are in-seed content fixes (Axis A accuracy + Axis B clarity); no model/UX changes needed.

## Notes

- The seed is strong out of the box. Table dynamics, card timing, and strategic priorities are well-founded. The two fixes are precision corrections (one factual, one clarity) that improve credibility and glanceability.
- Neigh Timing (Early Game) correctly identifies the core-game decision: Neighs are rare, save them for high-leverage blocks (Lasso, Destroy) not basic unicorn plays — a correct teaching priority.
- End-Game "One unicorn away from winning" is a standout: "Clear defenses, then play your 7th" is an excellent headline that teaches the sequence.
- Early Game's Target Selection (trailing context) captures table politics: the mechanism of pile-on (keeping the weak alive so they keep absorbing attacks) is subtle and well-explained.
