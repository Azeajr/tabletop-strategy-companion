# Retro — Stealth row budget fix (#7) — follow-up

- **Date**: 2026-06-13
- **Scope**: implementation follow-up to [2026-06-13-stealth-glanceability.md](./2026-06-13-stealth-glanceability.md)
- **Supersedes**: that retro's Axis C score (C: 3 → **4**)
- **Closes**: #7 (stealth one-screen row budget)

The theme retro found the corpus prose healthy but flagged one systemic gap: 6 phases exceed a safe
one-screen row budget and clip silently in stealth. The user chose the **hybrid** solution. This records
what landed.

## What shipped (the hybrid)

**Glance-by-default (a).** In stealth, `ActionAccordion` now collapses each phase to its **TLDR
strategies only**; the full set is one tap away via a `show all (N more)` pill. A phase with no TLDRs
falls back to showing all (it's small by the budget below). Study mode is untouched.

**Escape hatch that never clips (c-scoped).** `LiveCompanion` holds the `showAll` signal (reset on phase
change) and switches `<main>` to `overflow-y-auto` **only while expanded** — so "show all" scrolls
instead of clipping. The collapsed default stays `overflow-hidden` (pure glance).

**Forcing function (b).** New `schema.test`: every phase's collapsed view (category headers + condition
rows, TLDR-only when it has TLDRs, else all) must be **≤ 8 rows**. This pins the guarantee that the
stealth default fits — a future dense phase fails CI until it earns a TLDR or is split.

**Prerequisite content fix.** Measuring against the budget, exactly **one** phase failed:
`ticket-to-ride / Mid-Game` (10 rows, 0 TLDR — so it couldn't collapse). Promoted its key strategy
("One ticket away from completion" → *secure the route, a miss is a 2× swing*) to TLDR. It now collapses
to 2 rows, and gains a Key Strategies entry it lacked. The other 12 zero-TLDR phases were already within
budget showing all, so they were left alone (no artificial TLDRs forced).

## Re-scored verdict

| Axis | Was | Now | Note |
|------|:---:|:---:|------|
| B — Prose & delivery | 4+ | 4+ | unchanged (lines tightened in the first pass) |
| C — Model fit | **3** | **4** | the one-screen guarantee is now enforced, not hoped |

## Resolution of the original findings

- **C1 (one-screen budget)** → resolved: TLDR-collapse-by-default guarantees the glance fits; the budget
  test enforces it corpus-wide; scoped scroll makes "show all" safe.
- **C3 (line cap, minor)** → not pursued (marginal; mean line 31.7, max 46 after the first pass).

## Tests

- `ActionAccordion`: stealth collapses to TLDR-only + show-all reveals the rest (2 cases, flipping
  `appMode` via the store and restoring it in `afterEach`).
- `schema.test`: stealth row budget ≤ 8 across all 20 seeds.
- Full suite 101 green, build + lint clean.

## Notes

- The budget (8) is a deliberate proxy for one phone screen (≈ top bar 56px + stepper + the strategy
  list, leaving room for one open toggle). If a real device shows it's off, tune the single constant in
  `schema.test`.
- `nav_style: 'modes'` (battleship) and TLDR-collapse now both serve density: modes split a loop game's
  states; collapse trims an arc game's phase to its key moves. A new dense arc game has two clean levers.
- Stealth-glanceability is now both audited (theme retro) and structurally guaranteed (this fix). The
  remaining Pass 5 backlog is per-game strategy audits of the 19 seeds only battleship has covered.
