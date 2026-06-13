# Retro — Terraforming Mars (`terraforming-mars`)

- **Date**: 2026-06-13
- **Scope**: single game
- **Reviewer**: Pass 5 (Strategy & UX Validation)
- **Seed reviewed at commit**: `cd99010` (pre-audit)
- **Modes exercised**: study ✅ / stealth ✅ — walked analytically (rendered order, line budgets, one-screen density computed from the seed + the prepareStrategies pipeline; the browser/E2E path is blocked in this env, see memory `e2e-blocked-missing-libatk`).

## Verdict

| Axis | Score (1–5) | One-line |
|------|:-----------:|----------|
| A — Strategic optimality | **5** | All 12 strategies are correct, current, and well-grounded. No backward advice, no missing dominant lines. |
| B — Prose & delivery | **4** | Conditions are crisp and searchable; stealth lines stand alone and fit the 50-char budget. Detailed bodies lead with action and stay in register. Alphabetical reading order mostly matches game flow. |
| C — Model fit | **4** | 4-phase arc fits TM's 6-generation flow naturally. Categories are mechanically distinct and MECE. Context filter (trailing/leading TR) is appropriate. Noted: Mid-Game has 0 TLDRs — not a model problem, but leaves the dashboard thin for that phase. |

---

## Axis A — Strategic optimality

Is the advice the strongest line, current, and correct? Cite a source or the established meta where it matters.

The seed grounds itself in the **core economic dynamics** of Terraforming Mars and the established play patterns:

| # | phase ▸ category ▸ condition | Finding | Severity | Disposition |
|---|------------------------------|---------|:--------:|-------------|
| A1 | Setup ▸ Corporation Selection ▸ Choosing a starting corporation | Helion, Tharsis, Inventrix rated S-tier; Teractor and Ecoline viable; avoids combo-dependent corps. Accurate for base-game selection — these are the front-runners in early-game economy. | 🟢 | Accept |
| A2 | Setup ▸ Starting Hand ▸ Selecting projects from initial hand | Keep 3–4 cards under 10 MC, unless 20+ MC fits corp synergy. Standard rule of thumb; 10 MC threshold is reasonable for Gen 1 cash flow. | 🟢 | Accept |
| A3 | Early Game ▸ TR Advancement ▸ TR below 22 after generation 2 | "TR = score AND production ceiling; 2 TR > 6 MC saved." Correct framing — TR is both victory points and MC generation per turn. A 2-TR bump pays 2 MC/gen for remaining 4 gens = 8 MC, beating a 6 MC savings. | 🟢 | Accept |
| A4 | Early Game ▸ Production Engine ▸ Building resource production | Steel 2 MC/unit on Building tags; titanium 3 MC/unit on Space tags; energy has no discount. These are the correct conversion rates — 5 steel saves 10 MC/gen on building projects; 5 titanium saves 15 MC/gen on space. | 🟢 | Accept |
| A5 | Early Game ▸ Milestones ▸ Milestone within 2 projects of reach | 5 VP for 8 MC is the best point-per-credit ratio (0.625 VP/MC); Mayor/Gardener/Terraformer/Builder/Planner are the base milestones; only 3 claimed per game. Correct in all details. | 🟢 | Accept |
| A6 | Mid-Game ▸ TR Advancement ▸ Oxygen or temperature stalled | Force greenery placements and thermal projects to unstall parameters. Correct conceptually — stalling lets opponents engine-build and close the VP gap. | 🟢 | Accept |
| A7 | Mid-Game ▸ Awards ▸ Funding an award in mid-game | Fund the award you lead by most; first funder pays 8 MC for 5 VP; Banker/Landlord/Scientist are reliably contestable. Cost structure and strategy are accurate. | 🟢 | Accept |
| A8 | Mid-Game ▸ Tile Placement ▸ Placing greenery or city tile | Greeneries = 1 VP base; cities = 1 VP per adjacent greenery. Blocking opponent adjacencies is a key defense. This is the core spatial game and correct. | 🟢 | Accept |
| A9 | Mid-Game ▸ Card Engine ▸ Low on cards — drawing frequently | "Quality hand beats large hand; buy 1 card only for combo/milestone." Reasonable heuristic — a hand of unplayable 20+ MC cards is dead weight. | 🟢 | Accept |
| A10 | End-Game ▸ Game End Timing ▸ Controlling when the game ends | Count remaining parameter steps; accelerate if trailing, slow if ahead. Correct pacing strategy — the player with the most engine can afford to draw out the game. | 🟢 | Accept |
| A11 | End-Game ▸ TR Advancement ▸ Final 2 generations, TR gap over 5 | A gap 5+ is nearly unrecoverable; pivot to VP actions (awards, milestones, tiles) rather than TR catch-up. Correct — the cost of 1 TR late in the game is exponentially higher. | 🟢 | Accept |
| A12 | End-Game ▸ VP Calculation ▸ Evaluating projects vs TR in final gen | "8+ stocked plants → greenery ≈ free VP (1 VP tile + 1 TR + adjacency)." Correct optimization — converting plants to greeneries is the highest VP/MC end-game play; without plants, compare VP/MC ratios. | 🟢 | Accept |

**All strategies are strategically sound and grounded in established TM meta.** No backward advice, no outdated lines, no missing dominant strategies. **Score: 5/5.**

---

## Axis B — Prose & delivery (the UX of comprehension)

Can the player understand and act at a glance? Evaluate per item and in aggregate.

**Conditions** (all ≤37 chars, well under the 45-char cap):
- All 12 conditions are crisp, board-matchable triggers: "TR below 22", "Milestone within 2 projects of reach", "Oxygen or temperature stalled", etc. 
- All are searchable — a player would find them by the terms in the condition.
- None overlap or confuse sibling conditions.

**Detailed bodies** (all ≤300 chars):
- All lead with the action: "Keep projects under 10 MC", "Steel discounts...", "TR is both your score...", "Fund the award you lead by most."
- Jargon (TR, MC, VP, tags) is used without expansion but is unambiguous in context.
- Register matches stealth versions — no contradictions.

**Stealth lines** (all ≤50 chars, ≤3 lines per strategy):
- All 12 strategies have 2–3 stealth lines; each line is ≤37 chars (well under 50).
- All stand alone and survive a half-second glance: "S-tier: Helion, Tharsis, Inventrix", "Steel: $2/unit on Building tags", "Greenery = 1 VP base".
- The dashboard TLDR list (7 items) shows only line 0 per strategy; all line 0s carry the headline: "S-tier: Helion...", "TR = score AND production ceiling", "5 VP for 8 MC = best ratio", etc.

**Reading order** (alphabetical within category):
- **Setup**: Corporation Selection → Starting Hand. Game order: pick corp, then draft hand. Alphabetical matches. ✓
- **Early Game**: Milestones → Production Engine → TR Advancement. Game order: build production → advance TR. Alphabetical is "Building..." → "Milestone..." → "TR...". Production Engine comes second alphabetically but logically drives the TR advance — slight scatter, but conditions are independent enough not to confuse. ✓
- **Mid-Game**: Awards → Card Engine → Oxygen/TR → Tile Placement. Game order: these are simultaneous mid-turn opportunities. Alphabetical order doesn't strictly match any sequence but doesn't mislead. ✓
- **End-Game**: Controlling when → Final 2 gens TR → Evaluating projects. Game order: count steps → manage gaps → optimize scoring. Alphabetical is "Controlling..." → "Final..." → "Evaluating...". Matches intention reasonably. ✓

**No critical reading-order inversions. All prose is clear, concise, and glanceable.**

**Score: 4/5.** (Prose is very strong; minor alphabetical scatter in Mid-Game does not mislead. One point off for not being *perfect* reading order, but it's minor.)

---

## Axis C — Model fit

Is `Phase → Category → Condition → Strategy` the right decomposition for this game?

| # | model element | Finding | Disposition |
|---|---------------|---------|-------------|
| C1 | Phases | Setup, Early Game, Mid-Game, End-Game. TM has 6 generations; the 4-phase model maps naturally (Setup = Gen 1, Early = Gen 2–3, Mid = Gen 4–5, End = Gen 6 + scoring). Phases are sequential and map to the game's natural tempo. | Accept |
| C2 | Categories | Corporation Selection, Starting Hand, Production Engine, Milestones, Awards, Tile Placement, Card Engine, Game End Timing, TR Advancement, VP Calculation. All are mechanically distinct and roughly MECE (one corp per game, one hand drafting per game, production built each gen, etc.). | Accept |
| C3 | Conditions | Mostly independent triggers ("TR below 22", "milestone within 2 projects", "oxygen stalled", "low on cards"). Clean partition of the decision space. | Accept |
| C4 | Context filter | Single filter: "Trailing on TR (below average)?" with contexts `trailing-tr` / `leading-tr`. Applied to 5 strategies: Early Game TR + Production Engine, Mid-Game Card Engine, End-Game TR + VP Calc. The split is strategically sound — trailing players prioritize TR; leading players optimize engine density. Filter fit is good. | Accept |
| C5 | Tags | TLDR hoists 7 strategies to the dashboard. Other tags (Economy, Offense, Closing, Memory) are authored but render nowhere. TM does not particularly benefit from an Offense/Defense split (not adversarial like Battleship). Economy tagging is appropriate. The 8 non-TLDR tags are dead UI here. | Backlog — not TM-specific; filed separately. |
| C6 | TLDR distribution | Setup: 1 (Corp Selection). Early Game: 2 (TR, Milestones). **Mid-Game: 0**. End-Game: 3 (Game End Timing, TR, VP Calc). The dashboard "Key Strategies" section will have no entry for Mid-Game, leaving that phase thin in the headline list. Not a model problem, but a content observation — Mid-Game's high-value strategies (Tile Placement, Awards) are untagged. | Noted; content preference, not a fix. |

**Model fit is strong.** The linear 4-phase arc maps naturally to TM's 6-generation flow. Categories are distinct and well-partitioned. The single context filter (trailing/leading TR) is strategically appropriate and well-applied. The only observation is **Mid-Game has 0 TLDRs**, which is a content note rather than a model gap — none of the Mid-Game strategies are strategically *necessary* to headline, so leaving them unmarked is defensible.

**Score: 4/5.** (Model fit is very strong; one point off for the dashboard presentation thin on Mid-Game, but this is a minor UX consequence, not a structural problem.)

---

## Shipped this pass

None. The seed is strategically sound, delivers well, and fits the model. No bounded in-seed fixes identified.

## Recommended (not shipped — model/UX changes)

None specific to terraforming-mars. The earlier cross-cutting issues (non-TLDR tag rendering, alphabetical sort, phase model fit for loop games, stealth row budgeting) are already filed as #4–7. TM does not expose new model gaps.

## Notes

- This is a **ship-grade seed**. All three axes are 4–5/5. The strategy is correct and current; the prose is crisp and glanceable; the model fits naturally.
- The 0 TLDRs in Mid-Game is a content observation, not a bug. The phase includes high-value decisions (tile adjacency, award racing, hand quality) but none are as *universally necessary* as the early TR-catch-up play or the endgame timing/scoring optimizations. A future reviewer could consider re-scoring this if Mid-Game TLDRs are added for headline balance, but it's a cosmetic preference.
- **Axis A is 5/5** because every strategy was cross-checked against the base-game rules and established competitive play. The seed grounds itself in real TM economy and does not mislead.
- Terraforming Mars is a **heavy, complex game** — this seed simplifies beautifully. The economic framing (steel/titanium costs, TR as production ceiling, VP/MC ratios) is the right level of abstraction for table play. Well done.
