# Retro — Stealth glanceability (theme, all 20 seeds)

- **Date**: 2026-06-13
- **Scope**: cross-cutting theme — stealth-mode delivery across the whole corpus (242 strategies, 725 stealth lines)
- **Reviewer**: Pass 5 (Strategy & UX Validation)
- **Modes exercised**: stealth (LiveCompanion accordion + dashboard Key Strategies list); measured analytically (browser/E2E blocked here — see memory `e2e-blocked-missing-libatk`)

## Verdict

| Axis | Score (1–5) | One-line |
|------|:-----------:|----------|
| A — Strategic optimality | n/a | Out of scope — this is a delivery theme, not a per-game strategy audit. |
| B — Prose & delivery | 4 → **4+** | Corpus is glanceable (mean line 31.7 chars, 0 empty); a handful of at-cap lines tightened. |
| C — Model fit | **3** | One real systemic gap: nothing guards the stealth one-screen row budget → silent clipping. |

## What the corpus actually looks like (measured)

- **242 strategies / 725 stealth lines.** Mean line length **31.7 chars** (cap 50). 241 strategies have the full 3 lines, 1 has 2, **0 have an empty stealth array**.
- Lines at the dense end: **4 at ≥48, 10 at ≥45** (pre-pass). The line-density worry was **localized, not systemic** — most lines glance fine.
- **78 TLDR headlines** (the `strategy_stealth[0]` that's the *sole* content shown in the dashboard Key Strategies list in stealth): mean 32.4 chars, only **1 at the 50 cap**.

So the prose/delivery floor is healthy. The exception is structural, not per-line:

- **6 phases render ≥9 collapsed rows** (risk/Mid-Game 10, sequence/Early Game 10, ticket-to-ride/Mid-Game 10, 7-wonders/Age I 9, catan/Mid-Game 9, ticket-to-ride/Early Game 9). In stealth (`overflow-hidden`, one screen) these **clip silently** once the top bar + stepper + filter + search + an open toggle are added.

## Axis B — prose & delivery

| # | location | Finding | Severity | Disposition |
|---|----------|---------|:--------:|-------------|
| B1 | unstable-unicorns ▸ Win Attempt ▸ "One unicorn away from winning" | TLDR headline at the 50 cap, AND lines 0–1 were redundant (both "wait for Neighs, play 7th"). | 🟡 | **Shipped** — headline → "Clear defenses, then play your 7th"; deduped line 1. |
| B2 | unstable-unicorns ▸ Blocking Wins | "Coordinate with table — everyone loses if they win" (50, two-clause). | 🟢 | **Shipped** → "Get the table to block their win" (32). |
| B3 | stratego ▸ Flag Placement | "Flag 1 row off back edge, bombs behind = surprise" (49). | 🟢 | **Shipped** → "Flag 1 row up, bombs behind = surprise" (38). |
| B4 | clue ▸ Accusation Timing | "Wrong accusation = you're out but game continues" (48). | 🟢 | **Shipped** → "Wrong accusation = out; others play on" (38). |
| B5 | 6 lines at 45–46 (battleship ×2, clue, connect-4, farkle, guess-who) | At the upper end but single-clause and self-standing. | 🟢 | Accept — within the glance bar; not churned. |

After this pass: **max line 46, zero ≥48, six ≥45.**

## Axis C — model fit

| # | element | Finding | Disposition |
|---|---------|---------|-------------|
| C1 | One-screen budget | Stealth clips past one screen but nothing caps per-phase rows; 6 phases exceed a safe budget. The arc games can't use the `modes` split that rescued battleship. | **Issue [#7](https://github.com/Azeajr/tabletop-strategy-companion/issues/7)** |
| C2 | Empty-stealth floor | Zod permits an empty `strategy_stealth` (renders blank in stealth; blank dashboard headline for a TLDR). No seed violates it today, but nothing pinned it. | **Shipped** — regression test in `schema.test.ts`. |
| C3 | Line cap | The 50-char cap is generous vs the 31.7 mean; lowering toward ~45 is marginal. | Folded into #7 as a sub-finding; not pursued. |

## Shipped this pass

Bounded, within all Zod bounds; `npm test` (98) / build / lint green.

- [x] 4 over-dense stealth lines tightened (unstable-unicorns ×2, stratego, clue) — max line 50 → 46; one redundant headline pair deduped.
- [x] `schema.test.ts` — new "every strategy is glanceable in stealth mode" test: every strategy has ≥1 stealth line; every TLDR has a non-empty first line. Pins the floor Zod can't express (C2).

## Recommended (not shipped)

- [ ] **[#7](https://github.com/Azeajr/tabletop-strategy-companion/issues/7)** — stealth one-screen row budget: 6 phases clip silently; needs a design decision (TLDR-only collapse / soft cap + CI lint / scroll-within-body).

## Notes

- The headline takeaway: **the words are fine; the page budget isn't.** Effort on per-line tightening hits diminishing returns — #7 (structural) is where the remaining stealth-glanceability risk lives.
- `nav_style: 'modes'` is the one proven lever that cut a 10-row phase to 7 (battleship). Option (b) in #7 — a row-budget lint — would naturally push other dense games toward either splitting categories or adopting modes.
- This theme is now audited corpus-wide; the next high-value Pass 5 targets are per-game strategy audits of the seeds never individually reviewed (only battleship has one).
