# Retro — Battleship re-model (`battleship`) — follow-up

- **Date**: 2026-06-13
- **Scope**: implementation follow-up to [2026-06-13-battleship.md](./2026-06-13-battleship.md)
- **Supersedes**: the Axis C score in the original retro (C: 2 → **4**)
- **Closes**: #4 (engine: mode-tabs), #5 (render tags), #6 (explicit order)

The first retro shipped the content fixes and recommended three model changes as issues. The user
elected to implement all three — including #4 as the **engine** option (per-game nav style), not the
seed-only workaround. This records what landed and re-scores the model axis.

## What shipped

### #6 — explicit `order` (engine)
`StrategySchema` gains optional `order` (int ≥ 0, default 0). `prepareStrategies` now sorts a category's
members by `order` then condition-alphabetical, and orders categories by their smallest member `order`
then alphabetical; TLDR still hoists above both. Persisted as a (quoted) `"order"` column + additive
migration. **Every legacy seed defaults to 0 → byte-identical rendering** (pinned by a new
strategy.test case + the green DB suite).

### #5 — render non-TLDR tags (engine)
New `TagBadges` renders the 8 non-TLDR tags as inline pill badges on each condition, in both the
LiveCompanion accordion (`ConditionToggle`) and the PreGameDashboard deep-dive. TLDR is excluded (it's
conveyed by hoist + the Key Strategies list). Spacing is a CSS margin, not a text node, so it doesn't
disturb condition text. The player can now see "is this Offense / Defense / Economy?" at a glance.

### #4 — loop-game nav (engine, option 2)
`GameSeedSchema` gains `nav_style: 'arc' | 'modes'` (default `arc`). PhaseStepper renders the existing
linear stepper for `arc` (aria-current="step") and **free-select pill tabs** for `modes`
(aria-current="true", aria-label "Game modes") — no progression affordance. 19 arc games are untouched
(default). Battleship is re-modeled to `modes` with phases **Fleet Placement / Searching / Targeting /
Defense / Endgame**, every strategy re-assigned to the mode it actually belongs to, `order` set for
intended reading flow, and the low-value exposed/hidden filter retired (the real per-turn branch is now
first-class mode nav, not a hidden filter).

## Re-scored verdict

| Axis | Was | Now | Note |
|------|:---:|:---:|------|
| A — Strategic optimality | 4 | 4 | unchanged (content fixed in the first pass) |
| B — Prose & delivery | 4 | **4+** | tags now signal offense/defense; reading order is author-controlled |
| C — Model fit | **2** | **4** | the search↔target loop is honest mode nav; density cut; tags surfaced |

## Rendered reality (verified analytically)

Per-mode collapsed rows: Fleet Placement 5, Searching 7, Targeting 7, Defense 3, Endgame 3 — **max 7,
down from the old Hunt phase's 10** (C5). Modes let the at-table player jump straight to the relevant
state (tap Targeting on a hit) rather than scrolling one giant firing phase. Placement now reads
Ship Placement → No-Touch (the old alphabetical inversion is gone). Key Strategies headlines are all
clean and, post content-fix, correct.

## Resolution of the original Axis C findings

- **C1 (phase = loop misfit)** → resolved: phases are now `modes`, no false Search→Hunt sequence.
- **C2 (filter mis-targeted)** → resolved differently than proposed: rather than re-task the filter to
  the search/target branch, that branch became first-class mode nav (#4 option 2), and the filter was
  retired. Same intent, cleaner.
- **C3 (sort scramble)** → resolved: `order` makes reading order explicit (#6).
- **C4 (dead tags)** → resolved: tags render (#5).
- **C5 (Hunt density)** → mitigated: max mode is 7 rows and modes are independently navigable.

## Notes / what's left

- C5 is *mitigated, not eliminated* — a 7-row mode with an open toggle can still be tight on a small
  phone in stealth. If it bites, the next lever is per-mode TLDR-only collapsing in stealth (new issue,
  not opened yet).
- Battleship is the **first `modes` game**. The engine now supports loop games generally; the next
  loop-shaped seed (e.g. a trick-taking or fighting game) should reuse `nav_style: 'modes'` rather than
  forcing an arc. The amortization argument for the engine cost (vs the seed-only workaround) starts
  paying off at game #2.
- A cross-cutting **stealth-glanceability** Pass 5 across all 20 seeds remains the highest-value next
  audit (carried over from the first retro).
