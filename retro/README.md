# Retros

Dated analyses of the **strategy content and its delivery** in the shipped seeds — produced by
[ENGINEERING_PASSES.md § 5 — Strategy & UX Validation](../ENGINEERING_PASSES.md#5-strategy--ux-validation-retro).

A retro is not a code review. It answers three questions about a game (or a cross-cutting concern)
that already ships in `data/seeds/`:

1. **Is the strategy optimal?** — Is the advice correct, current, and the strongest line for the
   situation, or is it folk wisdom / outdated meta / plain wrong?
2. **Does the delivery make it understandable?** — Can a player parse the `condition` trigger and act
   on the `strategy_detailed` / `strategy_stealth` body at a glance, under table pressure, without
   re-reading? This is prose, density, ordering, and reading-level — the UX of comprehension.
3. **Does the model fit the game?** — Is the `Phase → Category → Condition → Strategy` decomposition,
   the two-register (study/stealth) split, the binary context filters, and the tag vocabulary the
   right way to break this game down — or is the game being forced into a shape that hides its real
   decision structure?

## What a retro produces

Each pass splits its findings two ways:

- **Shipped** — bounded, unambiguous fixes that live entirely inside a seed's content (a wrong number,
  a rewritten body, an over-long stealth line, a mis-tagged TLDR). These land in the same PR and are
  gated by `npm test` (Zod) + the views.
- **Recommended** — anything that changes the **model**: the Zod schema, the sort rules, the
  context-filter shape, rendering an unused tag, a new view. These do **not** ship in the pass — they
  are written up here and opened as GitHub issues. The retro is the design record; the issue is the
  work item.

## Naming

```
retro/YYYY-MM-DD-<game-id>.md        # single-game audit   e.g. 2026-06-13-catan.md
retro/YYYY-MM-DD-<scope>.md          # cross-cutting theme  e.g. 2026-06-13-stealth-glanceability.md
```

Use the run date (`date +%F`). One game (or one theme) per file keeps each retro deep.

## Conventions

- **Append-only.** A retro is a historical record of what was true on that date. Don't rewrite an old
  one when the meta shifts or a fix lands — write a new dated retro that supersedes it, and link back.
- Start from [TEMPLATE.md](./TEMPLATE.md).
- Link issues by number so the recommendation and its work item stay connected.
- Score each axis so drift is visible across runs (a game can be strategically perfect and still
  undeliverable, or beautifully delivered and strategically wrong — the axes are independent).
