# Retro — Battleship (`battleship`)

- **Date**: 2026-06-13
- **Scope**: single game
- **Reviewer**: Pass 5 (Strategy & UX Validation)
- **Seed reviewed at commit**: `2ea7cd8` (pre-fix)
- **Modes exercised**: study ✅ / stealth ✅ — walked analytically (rendered order, line budgets, one-screen density computed from the seed + the prepareStrategies pipeline; the browser/E2E path is blocked in this env, see memory `e2e-blocked-missing-libatk`).

## Verdict

| Axis | Score (1–5) | One-line |
|------|:-----------:|----------|
| A — Strategic optimality | 2 → **4** (after fixes shipped this pass) | Excellent hunt core (parity/PDF/target/stride), but placement advice was **backwards** and surfaced as the #1 headline. |
| B — Prose & delivery | 3 → **4** | Mostly crisp; near-duplicate conditions, one cryptic headline, dense exposed-context lines. |
| C — Model fit | **2** | Battleship's per-turn search↔target *loop* is forced into a linear-arc Phase model; filter mis-targeted; tags dead. All recommend-only. |

> The axes are independent — the hunt advice was correct yet undermined by wrong placement advice, and the whole thing is delivered through a model that doesn't fit the game.

---

## Axis A — Strategic optimality

The offensive core is strong and correctly chosen: **checkerboard parity** (smallest ship = 2 → every ship spans one color), **probability-density (PDF) hunting** ("count valid placements per cell, shoot the max, recompute"), **target mode** (orthogonal probe → extend on 2nd hit), **stride upgrade** (stride = min surviving ship length; Destroyer sunk → 3-stride …), and the **SUNK peg-count** deception read. These are the established optimal lines (Berry / DataGenetics) — keep them.

The **placement** advice was the opposite of correct. The Battleship first-shot probability heat map peaks at the **center** (a center cell is covered by far more ship placements than an edge/corner), so an optimal opponent fires the middle **first**; corner/edge cells are lowest-density and survive **longest**. The seed claimed the reverse ("center-biased Carrier survives longer", "edges get swept first / avoid edges"), and it was **internally inconsistent** — the exposed-context strat called edges "roughly neutral". Worst of all, the wrong line was the **#1 dashboard "Key Strategies" headline** ("Avoid edges and corners").

| # | phase ▸ category ▸ condition | Finding | Severity | Disposition |
|---|------------------------------|---------|:--------:|-------------|
| A1 | Fleet Placement ▸ Ship Placement ▸ Placing ships at game start | "Avoid edges and corners" is backwards vs a probability opponent; center is the first-fired, highest-density zone. Surfaced as the top dashboard headline. | 🔴 | **Shipped** — rewrote to "center is the hottest target → bias to edges, never cluster, vary layout". |
| A2 | Fleet Placement ▸ Ship Placement ▸ Placing the Carrier (5-square) | "center-biased survives longer / edges get swept first" — maximizes early detection, not minimizes. | 🔴 | **Shipped** — flipped to edge-leaning = lower-density = lasts longer. |
| A3 | Search ▸ Defense ▸ Opponent gets a hit on your ship | "walls get shot earlier … net effect roughly neutral" — uses the unsupported edge-sweeper model and contradicts A1/A2. | 🟡 | **Shipped** — aligned: rim ships are lower-density AND harder to finish (2/1 hunt directions), so the rim hides well. |
| A4 | (whole) | Parity is framed as the "Search phase" method and PDF as the "Hunt phase"; PDF is actually optimal from move 1 and subsumes parity. | 🟢 | Accept — the split is a defensible teaching progression; noted, not fixed. |

## Axis B — Prose & delivery (the UX of comprehension)

Bodies generally lead with the action and stay in register. Problems were local: two near-identical condition triggers in different categories, one cryptic dashboard headline, and three stealth lines packed to 47–50 chars in a single toggle the player reads under pressure.

| # | location | Finding | Severity | Disposition |
|---|----------|---------|:--------:|-------------|
| B1 | Hunt ▸ Probability ▸ "Active hit, ship not yet sunk" vs Hunt ▸ Hunt Mode ▸ "Hit confirmed, ship not yet sunk" | Near-duplicate triggers in different categories — confusable at a glance, don't convey the PDF-vs-basic distinction. | 🟡 | **Shipped** — renamed condition to "Active hit, refining the probability map". |
| B2 | Hunt ▸ Probability ▸ (above), stealth line 0 | Dashboard TLDR headline was "Hit squares = passable (not blockers) in PDF" — cryptic out of context. | 🟡 | **Shipped** — line 0 → "After a hit, score placements through it". |
| B3 | Search ▸ Defense ▸ Opponent gets a hit on your ship | All 3 stealth lines 47–50 chars (at cap), two-clause — dense for a half-second glance. | 🟢 | **Shipped** — tightened to 33–46 chars alongside A3. |
| B4 | aggregate | Endgame contributes **0 TLDRs** → nothing in dashboard "Key Strategies" for that phase. | 🟢 | Accept — endgame is situational; flagged only. |

## Axis C — Model fit

This is where Battleship strains the platform's model. All findings are model/contract changes → **recommend-only**, opened as issues.

| # | model element | Finding | Disposition |
|---|---------------|---------|-------------|
| C1 | Phases | Battleship has no temporal arc — it's a per-turn **search↔target loop**. "Search" and "Hunt" interleave every turn but render as a linear stepper. The key per-turn branch ("active unsunk hit?") is split across phases instead of being a mode/filter. | **Issue [#4](https://github.com/Azeajr/tabletop-strategy-companion/issues/4)** |
| C2 | Context filter | The one filter encodes a minor defensive case (`exposed`/`hidden`, only 2/15 strategies). The higher-value binary (active hit → target vs search) is the one that drives *every* shot — but it's modeled as phases. Folded into #4. | **Issue [#4](https://github.com/Azeajr/tabletop-strategy-companion/issues/4)** |
| C3 | Categories / order | Hunt has 4 overlapping, non-MECE categories (Hunt Mode / Probability / Sink Priority / Targeting) that alphabetical sort scatters. Fleet Placement renders **"No-Touch Rule ▸ Placing remaining ships" before "Ship Placement ▸ Placing ships at game start"** — reading order inverted. | **Issue [#6](https://github.com/Azeajr/tabletop-strategy-companion/issues/6)** |
| C4 | Tags | Battleship advice is sharply Offense (your shots) vs Defense (your placement), but all 8 non-TLDR tags render nowhere — the player can't tell which a strategy is. Strongest motivating case for surfacing tags. | **Issue [#5](https://github.com/Azeajr/tabletop-strategy-companion/issues/5)** |
| C5 | Density | Hunt renders **10 collapsed rows** (4 categories + 6 conditions) — the densest phase; in stealth (`overflow-hidden`, one screen) an open toggle risks clipping. Knock-on of C1/C3 (the phase is overloaded because the loop is crammed into it). | Backlog — resolves if #4/#6 land. |

---

## Shipped this pass

In-seed content fixes, within all Zod bounds; `npm test` (89) / build / lint green.

- [x] `battleship.json` — **A1**: rewrote "Placing ships at game start" (detailed + stealth) — center is the hottest target, bias to edges, never cluster, vary layout. Fixes the wrong #1 dashboard headline.
- [x] `battleship.json` — **A2**: flipped "Placing the Carrier" — edge-leaning = lower-density = lasts longer (was "center-biased survives longer").
- [x] `battleship.json` — **A3 + B3**: rewrote "Opponent gets a hit on your ship" — rim ships are lower-density AND harder to finish; tightened the three dense stealth lines.
- [x] `battleship.json` — **B1 + B2**: renamed condition → "Active hit, refining the probability map"; fixed the cryptic stealth headline.

## Recommended (not shipped — model/UX changes)

- [ ] **[#4](https://github.com/Azeajr/tabletop-strategy-companion/issues/4)** — Phase model misfits loop-structured games — Battleship's search↔target loop isn't a linear arc; the primary per-turn branch should likely be the context filter, not phases.
- [ ] **[#5](https://github.com/Azeajr/tabletop-strategy-companion/issues/5)** — Render non-TLDR tags — 8/9 tags are dead UI; Battleship's Offense/Defense split is the motivating case.
- [ ] **[#6](https://github.com/Azeajr/tabletop-strategy-companion/issues/6)** — Alphabetical sort scrambles authored reading order — placement steps render out of sequence.

## Notes

- The hunt math is genuinely good — this seed's problem was never the strategy theory, it was (a) one inverted defensive premise that propagated into the headline, and (b) a game whose decision structure (a loop, with a hard offense/defense split) the linear Phase + hidden-tag model can't express. The first was fixable in content; the second is the real backlog.
- Next reviewer: if #4 lands and battleship is re-modeled (filter = "active hit?"), re-score Axis C and supersede this retro with a new dated file.
- A cross-cutting **"stealth-mode glanceability"** theme (C5 density + the at-cap lines seen here) is worth its own Pass 5 run across all 20 seeds.
