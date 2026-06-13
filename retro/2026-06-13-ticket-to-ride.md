# Retro — Ticket to Ride (`ticket-to-ride`)

- **Date**: 2026-06-13
- **Scope**: single game
- **Reviewer**: Pass 5 (Strategy & UX Validation)
- **Seed reviewed at commit**: `cd99010` (current main)
- **Modes exercised**: study ✅ / stealth ✅ — walked analytically (rendered order, line budgets, per-phase collapsed-row counts computed from the seed + the prepareStrategies pipeline; the browser/E2E path is blocked in this env, see memory `e2e-blocked-missing-libatk`).

## Verdict

| Axis | Score (1–5) | One-line |
|------|:-----------:|----------|
| A — Strategic optimality | **5** | Mathematically sound hunt for route efficiency, ticket leverage, and longest-train competition. |
| B — Prose & delivery | **4** | Crisp conditions, standalone stealth lines; End-Game lacked TLDR headlines until this pass. |
| C — Model fit | **5** | Linear arc, sensible categories, well-targeted context filter (longest vs tickets). |

> The advice is ship-grade correct and well-delivered. One fix shipped: End-Game now surfaces its critical timing decisions in the dashboard TLDR list.

---

## Axis A — Strategic optimality

The core advice is grounded in the established Ticket to Ride meta and reflects the mathematical decision points:

- **Route efficiency**: 5-6 car routes hit the superlinear scoring inflection (4 pts → 6 pts); emphasis on multi-purpose routes (serving 2+ tickets) is optimal. ✓
- **Longest Train leverage**: 10-point bonus is correctly positioned as worth more than most tickets. Connected spine strategy is sound. ✓
- **Ticket completion**: "2× ticket value swing" on S14 (fail = −value + loss of +value = 2× penalty) is the highest-leverage moment — correctly elevated to TLDR. ✓
- **Blocking math**: 2-3 car blocks are the sweet spot for cost/benefit — don't detour just to block. Correct. ✓
- **Card draw**: ~10% wild chance in blind draw (3 wilds out of ~60 base cards per color) is approximately correct; face-up logic (take only needed colors, refresh on 3-wild) is sound. ✓
- **Context branching**: Longest vs Tickets is a genuine strategic fork — the two filter paths diverge (S7 vs S8, S13 vs S12, S14 vs S18). Well-modeled. ✓
- **New ticket threshold**: 70% completion before drawing new tickets balances risk and option value — reasonable and defensible. ✓

All numbered claims (Longest Train = 10 pts, failing a ticket = full penalty, etc.) are rules-correct. No outdated meta or folk wisdom. All conditions filed under the right phase and decision point.

| # | phase ▸ category ▸ condition | Finding | Severity | Disposition |
|---|------------------------------|---------|:--------:|-------------|
| A1 | (whole) | All strategic advice is mathematically sound and reflects established meta (route efficiency, longest-train competition, ticket leverage, card draw odds, blocking cost/benefit). | 🟢 | Accept |

## Axis B — Prose & delivery (the UX of comprehension)

Conditions are precise and board-matchable; stealth lines stand alone and survive a half-second glance.

| # | location | Finding | Severity | Disposition |
|---|----------|---------|:--------:|-------------|
| B1 | (whole conditions) | All 18 conditions are distinct, crisp, and board-matchable in <2s. No near-duplicates or vague triggers. | 🟢 | Accept |
| B2 | (whole stealth) | All `strategy_stealth` lines lead with the action and stay under 50 chars. Dashboard headline (line 0) carries the TLDR for each strategy. Detailed bodies lead with action and stay within 300-char limit. | 🟢 | Accept |
| B3 | End-Game delivery | **Before this pass**: End-Game had 0 TLDRs → the dashboard "Key Strategies" list had no End-Game headline, missing the critical "when to trigger" and "final-turn timing" decisions at a glance. | 🟡 | **Shipped** — promoted S15 and S16 to TLDR, surfacing the two most critical end-game timing decisions. Improves dashboard glanceability without exceeding stealth budget. |
| B4 | (whole reading order) | Conditions sort alphabetically within categories. Early Game Route Claiming ("Choosing between..." < "Opponent building...") and End-Game categories are non-temporal, so alphabetical order doesn't scatter a sequence the player reads top-to-bottom. | 🟢 | Accept |
| B5 | Stealth collapsed row budget | Setup: 1 TLDR (S1, S3) + 2 category headers = ~4 rows. Early Game: 2 TLDRs (S7, S8) + 4 category headers = ~6 rows. Mid-Game: 2 TLDRs (S13, S14) + 5 categories = ~7 rows. End-Game (after fix): 2 TLDRs (S15, S16) + 3 categories = ~5 rows. All ≤8 rows. ✓ | 🟢 | Accept |

## Axis C — Model fit

The Phase → Category → Condition → Strategy decomposition fits Ticket to Ride's structure cleanly.

| # | model element | Finding | Disposition |
|---|---------------|---------|-------------|
| C1 | Phases | Ticket to Ride follows a linear temporal arc: Setup (initial tickets) → Early Game (building foundation) → Mid-Game (competition / pivots) → End-Game (endgame race). Model fits perfectly. | Accept |
| C2 | Categories | Sensible MECE buckets: Ticket Selection, Card Draw Strategy (Setup); Route Claiming, Card Collection, Longest Train, Ticket Focus (Early); Blocking, Card Collection, New Tickets, Longest Train, Ticket Focus (Mid); End-Game Timing, Longest Train, Ticket Focus (End). Alphabetical order within each phase doesn't mislead. | Accept |
| C3 | Context filter | Filter 1 (Longest Train bonus? yes/no) correctly models the strategic fork that shapes route-building (spine for 10pts vs focused ticket paths). The two filter paths have distinct strategies (S7/S8, S13/S12, S14/S18, S17/S18). Well-targeted. | Accept |
| C4 | Tags | Non-TLDR tags (Offense, Defense, Economy, Bluff, Closing, Memory) are authored but rendered nowhere. Ticket to Ride doesn't have an off-table communication need like Battleship's Offense/Defense split, so the absence of tag rendering is not a fit issue. | Backlog (cross-cutting rendering work, not game-specific) |

---

## Shipped this pass

In-seed content fixes, within all Zod bounds; validated by inspection.

- [x] `ticket-to-ride.json` — **B3**: promoted S15 ("Deciding when to trigger end game", End-Game Timing) and S16 ("Opponent is about to trigger end game") to TLDR tag. Surfaces the two critical endgame timing decisions in the dashboard "Key Strategies" list, improving glanceability without exceeding the stealth 8-row per-phase budget.

## Recommended (not shipped — model/UX changes)

None. All findings fit within the current schema and model.

## Notes

- Ticket to Ride's advice is ship-grade correct: the math is sound (route scoring, longest-train leverage, ticket swing calculations), the phase/category/condition decomposition is clean, and the context filter maps the strategic fork well.
- The one fix was a delivery miss: End-Game had no TLDRs, so the dashboard "Key Strategies" section skipped the game's most leveraged endgame decisions. Promoting the two timing strategies fixes this without model changes.
- Historic note: a prior pass already promoted S14 ("One ticket away from completion", Ticket Focus, Mid-Game) to TLDR to fix a stealth-budget overflow. This fix follows the same pattern — surfacing the highest-value phase decisions for at-table glance-reference.
- TTR has historically been one of the densest Mid-Game and Early Game seeds (per the specification notes). This audit confirms both phases now collapse cleanly to ≤8 rows in stealth.
