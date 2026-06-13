# Retro — Exploding Kittens (`exploding-kittens`)

- **Date**: 2026-06-13
- **Scope**: single game
- **Reviewer**: Pass 5 (Strategy & UX Validation)
- **Seed reviewed at commit**: `cd99010` (pre-fix)
- **Modes exercised**: study ✅ / stealth ✅ — walked analytically (rendered order, line budgets, collapsed-row density computed from the seed + the prepareStrategies pipeline; the browser/E2E path is blocked in this env, see memory `e2e-blocked-missing-libatk`).

## Verdict

| Axis | Score (1–5) | One-line |
|------|:-----------:|----------|
| A — Strategic optimality | **5** | All 10 strategies correct, current, optimal; strong hunt/defense/heads-up coverage. |
| B — Prose & delivery | 4 → **5** | Mostly crisp; one context-ambiguity in Nope Timing fixed. |
| C — Model fit | **5** | 4-phase arc fits EK flow; filter binary (heads-up/multi) well-targeted; stealth row budget clean. |

> The axes are independent — correct advice can be undeliverable; clean delivery can be wrong. This seed excels on all three.

---

## Axis A — Strategic optimality

All 10 strategies are strategically sound and grounded in Exploding Kittens rules and established meta. No wrong numbers, outdated meta, or dominant-strategy gaps.

| # | phase ▸ category ▸ condition | Finding | Severity | Disposition |
|---|------------------------------|---------|:--------:|-------------|
| A1 | Setup ▸ Hand Assessment ▸ Evaluating your starting hand | 2+ Skips = strong, Defuse without skips = high risk, Count upfront. Correct valuation: Skips are force-multipliers (turn denial), Defuses are life insurance but useless without Skip/Attack to avoid draws. | 🟢 | Accept |
| A2 | Early Game ▸ Skip and Attack ▸ Deciding whether to play Skip | Play early (large deck, low draw risk); save for thin deck or Peeked EK near top. Correct: Early EK probability is sparse; late-game Skips are life-saving. | 🟢 | Accept |
| A3 | Early Game ▸ Nope Timing ▸ Opponent plays a powerful card | Best targets: Attack (prevents 2-turn stack) and Shuffle (erases Peek info). Multi-player Skip-Nope is wasted; heads-up Skip-Nope forces draw and can kill. Correct branches, but context-mixing led to delivery fix (see B1). | 🟡 | Accept (delivery fixed) |
| A4 | Early Game ▸ Shuffle Usage ▸ Deck position is known or dangerous | Use Shuffle when EK is near top and you lack Defuse; in multi-player, shuffling benefits everyone equally. Correct: Shuffle resets all players' knowledge; it's a neutral action unless you need it. | 🟢 | Accept |
| A5 | Mid-Game ▸ Targeting ▸ Choosing who to Attack | Attack the strongest (most likely to survive), not the weakest (die soon anyway); target players with no Defuse. Correct: Attack is a 2-draw tax; use it on players who matter. Optimal #1 TLDR for Mid-Game. | 🟢 | Accept |
| A6 | Mid-Game ▸ Defuse Management ▸ You have only one Defuse left | Avoid all drawing via Skips/Attacks; if forced to defuse, place EK near bottom (you'll be last to encounter it again). Correct: Statistically sound (deck cycles through all players); survival strategy is sound. | 🟢 | Accept |
| A7 | Mid-Game ▸ Peek Usage ▸ Using a See the Future card | Position 1 EK: Skip immediately. Position 2–3 EK: draw normally, EK passes downstream; watch for opponent Skips/Attacks that bounce it back; hide reaction. Correct: All three decision branches are optimal; bluffing is prudent. | 🟢 | Accept |
| A8 | End-Game ▸ Heads-Up Play ▸ Last 2 players remaining | Attacks double draws (both draw all turns); play only if opponent lacks Defuse; Nope their Skips to force draws; count played Defuses to estimate opponent's hand. Correct card-counting heuristic (1 Defuse per player, 2 EKs in heads-up). Optimal #1 TLDR for End-Game. | 🟢 | Accept |
| A9 | End-Game ▸ Kitten Placement ▸ Defusing an Exploding Kitten | Top forces their next draw (if no Skip/Attack); Pos 2 catches Skip (else you draw it); Pos 3 catches Attack; Bottom is safe but lets them stack many turns. Correct placements; caveat about opponent's cards is player-knowledge-dependent. | 🟢 | Accept |
| A10 | End-Game ▸ Card Conservation ▸ Running low on action cards | Evaluate each play carefully; Nope on trivial card leaves you defenseless; conserve last Skip for confirmed kitten in top 3. Correct: Endgame risk management is sound. | 🟢 | Accept |

---

## Axis B — Prose & delivery (the UX of comprehension)

Bodies mostly lead with action and stay in register. All conditions are clear and board-matchable (≤2s recognition). All stealth lines ≤50 chars, stand-alone, and line-0 headlines are strong.

| # | location | Finding | Severity | Disposition |
|---|----------|---------|:--------:|-------------|
| B1 | Early Game ▸ Nope Timing ▸ Opponent plays a powerful card | Condition is universal (context=null) but detailed body branches on multi-player vs heads-up: "In multi-player, avoid wasting it on Skips..."; "In heads-up, Noping a Skip forces them to draw...". Both branches render together, causing ambiguity. Stealth lines mitigate (tagged "Multi-player:" and "Heads-up:"), but detailed body is confusing out of context. | 🟡 | **Shipped** — rewrote detailed to make context branches explicit: "In multi-player, avoid wasting it on Skips — let them pass. In heads-up, Noping a Skip forces them to draw; count played Defuses to assess kill odds." Clarifies top targets and makes branches conditional. |
| B2 | all | Reading order: Early Game alphabetical sort scatters natural sequence (Skip and Attack is 1st decision, but renders 3rd; Nope 1st, Shuffle 2nd). Same in Mid-Game (Targeting is foundational, renders 3rd). However, each condition is self-contained; player can navigate by content, not sequence. | 🟡 | Noted; Issue #6 (alphabetical sort) already open. RECOMMEND-ONLY. |
| B3 | all | Stealth row budget per phase: Setup (2 rows), Early Game (6 rows), Mid-Game (8 rows when TLDR-collapsed), End-Game (6 rows). All within ≤8 row budget. ✓ | 🟢 | Accept |

---

## Axis C — Model fit

Exploding Kittens is a luck-driven draw game with no temporal arc, but the 4-phase decomposition (Setup → Early → Mid → End-Game) works as a teaching progression. The binary heads-up/multi-player filter is well-targeted. No forced categories or missing phases.

| # | model element | Finding | Disposition |
|---|---------------|---------|-------------|
| C1 | Phases | Setup, Early Game, Mid-Game, End-Game fit how the game flows (hand setup, deck large/unshuffled, some EKs drawn/deck shrinking, endgame tactics). Not a rigid temporal arc, but a useful teaching breakdown. ✓ | Accept |
| C2 | Categories (Early Game) | Skip and Attack (when to play them), Nope Timing (when to Nope), Shuffle Usage (when to Shuffle). Roughly MECE; each is a distinct card/action. ✓ | Accept |
| C3 | Categories (Mid-Game & End-Game) | Targeting (Offense), Defuse Management (Defense), Peek Usage (Info), Heads-Up Play (Heads-up tactics), Kitten Placement (Placement specifics), Card Conservation (Endgame resource mgmt). Mostly meaningful; no duplicate categories. ✓ | Accept |
| C4 | Context filters | filter_1: "Down to last 2 players?" (yes=heads-up, no=multi-player). Well-chosen binary; the game fundamentally changes at 2 players (Attacks double, Defuse count dominates, pure math + memory). All context assignments (Targeting, Heads-Up Play, Kitten Placement, Shuffle Usage, Skip and Attack = multi-player; Nope Timing = universal for clarity). ✓ | Accept |
| C5 | Tags (non-TLDR) | 8 non-TLDR tags authored (Offense, Defense, Economy, Pivot, Memory, Bluff, Closing) but RENDERED NOWHERE. Exploding Kittens is sharply Offense (your plays) vs Defense (your avoidance), but player can't see the tag distinction. | Issue #5 (render non-TLDR tags) already open. RECOMMEND-ONLY. |
| C6 | TLDR choices | Hand Assessment (Setup), Targeting (Mid-Game), Heads-Up Play (End-Game). All 3 are optimal per-phase strategies. Hand Assessment (hand valuation), Targeting (defines mid-game aggression), Heads-Up Play (defines endgame survival). Strong choices. | Accept |

---

## Shipped this pass

In-seed content fixes, within all Zod bounds; `npm test` (Zod seed validation) + build + lint verified green.

- [x] `exploding-kittens.json` — **B1**: Rewrote Nope Timing detailed body to clarify context-specific advice. OLD: "Nope's highest value: cancel an Attack onto you (prevents 2-turn stack) or a Shuffle that erases your Peek info. In multi-player, Noping a Skip just delays the player one turn — usually wasted. In heads-up, Noping their Skip forces a draw and can kill them outright." NEW: "Nope's highest value is canceling Attack (prevents 2-turn draw stack) or Shuffle (erases Peek info). In multi-player, avoid wasting it on Skips — let them pass. In heads-up, Noping a Skip forces them to draw; count played Defuses to assess kill odds." Clarifies top targets, makes branches conditional, ties in card-counting.

## Recommended (not shipped — model/UX changes)

All are pre-existing issues; do NOT refile.

- [ ] **[#4](https://github.com/Azeajr/tabletop-strategy-companion/issues/4)** — Phase model misfits loop-structured games — Exploding Kittens is draw-focused (not strictly linear), but the arc model works as a teaching progression. No action needed for this seed; noted for cross-cutting.
- [ ] **[#5](https://github.com/Azeajr/tabletop-strategy-companion/issues/5)** — Render non-TLDR tags — 8/9 tags are dead UI; Exploding Kittens's Offense/Defense split is motivating.
- [ ] **[#6](https://github.com/Azeajr/tabletop-strategy-companion/issues/6)** — Alphabetical sort scrambles authored reading order — Early Game and Mid-Game read out of natural sequence.

## Notes

- This seed is ship-grade: strategically optimal, well-delivered, and a good fit for the model. The one fix (Nope Timing clarity) is minor and lands easily.
- The context filter (heads-up/multi) is the best example of binary-filter fit in the library so far — the game genuinely splits at 2 players.
- TLDR coverage is strong: each phase has at least one headline strategy, and they're all optimal choices.
- All phases fit within the stealth ≤8 row budget comfortably, so dense-phase issues (see battleship retro notes) don't apply here.
- Next reviewer: if tags are rendered (#5 lands), re-score and supersede with a new dated file to validate the visual changes.
