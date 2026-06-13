# Retro — <Game Name> (`<game-id>`)

- **Date**: YYYY-MM-DD
- **Scope**: <single game | theme across N seeds>
- **Reviewer**: <name / agent>
- **Seed reviewed at commit**: <short-sha>
- **Modes exercised**: study ✅ / stealth ✅ (both views: PreGameDashboard + LiveCompanion)

## Verdict

| Axis | Score (1–5) | One-line |
|------|:-----------:|----------|
| A — Strategic optimality | | |
| B — Prose & delivery | | |
| C — Model fit | | |

> 5 = ship-grade, 3 = usable with caveats, 1 = misleads the player.
> The axes are independent — correct advice can be undeliverable; clean delivery can be wrong.

---

## Axis A — Strategic optimality

Is the advice the strongest line, current, and correct? Cite a source or the established meta where it
matters. Flag: wrong rules/numbers, outdated meta, a dominant strategy that's missing, advice that's
right in general but wrong for the phase/condition it's filed under, context advice that inverts
(leading vs trailing) the real play.

| # | phase ▸ category ▸ condition | Finding | Severity | Disposition |
|---|------------------------------|---------|:--------:|-------------|
| A1 | | | 🔴/🟡/🟢 | Shipped / Issue #__ / Won't-fix |

## Axis B — Prose & delivery (the UX of comprehension)

Can the player understand and act at a glance? Evaluate per item and in aggregate:

- **`condition`** (≤45 chars) — a precise, board-matchable trigger the player can recognize in <2s, or
  vague/overlapping with a sibling?
- **`strategy_detailed`** (study, ≤300 chars) — a crisp paragraph or a wall? Leads with the action or
  buries it? Jargon/acronyms expanded on first use?
- **`strategy_stealth`** (≤3 lines, ≤50 chars each) — does each line stand alone and survive a
  half-second glance? Does the set degrade gracefully (esp. the dashboard TLDR list, which shows only
  **line 0**)? Does the open toggle fit the stealth one-screen clip (`overflow-hidden`)?
- **Reading order** — conditions sort **alphabetically** within a category. Does that scatter a
  sequence the player reads top-to-bottom (1st → 2nd → 3rd)?

| # | location | Finding | Severity | Disposition |
|---|----------|---------|:--------:|-------------|
| B1 | | | 🔴/🟡/🟢 | Shipped / Issue #__ |

## Axis C — Model fit

Is `Phase → Category → Condition → Strategy` the right decomposition for **this** game?

- **Phases** — do the declared `phases` match how the game actually flows, or is a phase empty / forced
  / missing?
- **Categories** — meaningful and roughly MECE, or arbitrary buckets? Alphabetical category order ever
  misleading?
- **Conditions** — partition the decision space cleanly, or overlap / leave gaps?
- **Context filters** — does the binary yes/no model fit the game's real branching state, or is it
  forced (or absent where it's needed)?
- **Tags** — the 8 non-TLDR tags are authored but **rendered nowhere** today. Did this game want a
  channel they'd provide (e.g. surfacing Offense/Defense)? Note it for the cross-cutting backlog.

| # | model element | Finding | Disposition |
|---|---------------|---------|-------------|
| C1 | | | Issue #__ / Backlog / Accept |

---

## Shipped this pass

Bounded, in-seed content fixes that landed in this PR.

- [ ] `<game-id>.json` — <what changed and why> (commit `<sha>`)

## Recommended (not shipped — model/UX changes)

Each is a GitHub issue with problem / proposal / acceptance criteria.

- [ ] **#__** — <title> — <one-line why it's out of pass scope>

## Notes

<Anything that didn't fit a row: a pattern across items, a question for the next reviewer, a
game-specific judgment call worth recording.>
