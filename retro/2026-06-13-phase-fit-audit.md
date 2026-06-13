# Retro — Phase-fit audit (theme, all 20 games)

- **Date**: 2026-06-13
- **Scope**: cross-cutting — does every declared phase/mode hold a real, actionable decision for that stage?
- **Reviewer**: Pass 5 (Strategy & UX Validation)
- **Supersedes**: the 5-mode "Defense" framing in [2026-06-13-battleship-remodel.md](./2026-06-13-battleship-remodel.md) and the Setup note in [2026-06-13-guess-who.md](./2026-06-13-guess-who.md)

## Why this pass

The battleship remodel added a **Defense** mode to hold two strategies that fit neither Searching nor Targeting. A user flagged it: Battleship has **no in-game defense** — once ships are placed you take zero defensive actions, you only announce hit/miss. So "Defense" was a tab with nothing to *do* in it — an orphan bucket. That prompted a sweep of all 20 games for the same failure mode: a phase that is **mislabeled, an orphan bucket, or non-actionable**.

## The test

A phase earns its place only if the player has **at least one real decision to make while in it**. A phase whose content is "there's nothing to decide here," or that just restates another phase's reasoning, or that holds leftovers, fails.

## Findings

| game | phase | verdict | action |
|------|-------|---------|--------|
| **battleship** | Defense | 🔴 Orphan/non-actionable — no in-game defense exists; held one offense+psychology note and one placement rationale. | **Fixed** — mode dissolved. Rim-survival reasoning folded into Fleet Placement ("Placing against a wall or corner"); the parity-discipline note dropped as redundant with the Searching parity strategy. Battleship: 5 → **4 modes**. |
| **guess-who** | Setup | 🔴 Non-actionable — its own TLDR body read *"your card is dealt randomly — there is no selection,"* and the variant advice (rare features) doesn't actually beat a binary-search opponent. | **Fixed** — strategy deleted, **Setup phase dropped**. guess-who: 4 → **3 phases** (Early / Mid / End — the game starts the moment you ask a question). |
| **sequence** | Setup | 🟢 Real — "Choosing your seat": in team play, seat determines board coverage and corner access (corners are free chips). Actionable pre-game decision. | Keep. |
| **clue / codenames / exploding-kittens** | Setup | 🟢 Real — deduction-sheet setup, spymaster board-read + first clue, starting-hand evaluation are all genuine decisions. | Keep. |
| all other arc games | — | 🟢 Every phase holds actionable stage-specific decisions (verified via the phase→conditions dump). | Keep. |

## Principle (added to the model's working rules)

- A **mode** (`nav_style: 'modes'`) must be a state the player is actively *in and acting from*. Battleship's loop has exactly two such offensive states (Searching, Targeting) plus the one-time Fleet Placement and the Endgame deduction — there is no "Defense" state to act from.
- A **Setup phase** is justified only when setup involves a real choice (draft, placement, role/seat). Games with a random or trivial start (guess-who) should not declare one.

## Shipped this pass

- [x] `battleship.json` — dissolved Defense mode (4 modes); rim rationale → Fleet Placement, parity note dropped.
- [x] `guess-who.json` — dropped non-actionable Setup phase + its strategy (3 phases).

## Recommended (not shipped)

None. No other game declares a phase that fails the actionable-decision test.

## Notes

- This is the failure mode the original parallel fan-out **missed** for battleship — each agent audited its own game in isolation and accepted "Defense" / "Setup" at face value. Catching it needed (a) a user's sanity check and (b) a central cross-game sweep. Worth repeating the phase-fit test as a quick gate whenever a new seed is authored or a game is remodeled into `modes`.
