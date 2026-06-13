# Retro — Backgammon (`backgammon`)

- **Date**: 2026-06-13
- **Scope**: single game
- **Reviewer**: Pass 5 (Strategy & UX Validation)
- **Seed reviewed at commit**: `cd99010` (current main)
- **Modes exercised**: study ✅ / stealth ✅ — walked analytically (rendered order, line budgets, one-screen density computed from the seed + the prepareStrategies pipeline; the browser/E2E path is blocked in this env, see memory `e2e-blocked-missing-libatk`).

## Verdict

| Axis | Score (1–5) | One-line |
|------|:-----------:|----------|
| A — Strategic optimality | **5** | All advice is correct, grounded, and competitively current. |
| B — Prose & delivery | **4** | Crisp conditions, self-contained stealth lines, strong TLDR headlines; one minor priming phrasing. |
| C — Model fit | **5** | Phase arc, category splits, and context filter (pip-lead/trail) are a perfect fit. |

> The axes are independent — this seed is optionally shippable without any changes.

---

## Axis A — Strategic optimality

The seed covers the core competitive backgammon meta: XG-verified opening plays, pip-count-driven game planning, defensive anchoring, prime theory, blitz closeout, back-game timing, safe bearing-off, and doubling-cube thresholds. All numbers, rules, and strategic principles check against the established literature (XG analysis, Kernot/Woolsey cube theory, classical back-game theory).

| # | phase ▸ category ▸ condition | Finding | Severity | Disposition |
|---|------------------------------|---------|:--------:|-------------|
| A1 | Opening ▸ Opening Rolls ▸ Best opening roll to play | All five rolls (3-1, 4-2, 6-1, 5-3, 6-5) are XG-confirmed optimal plays — pointing beats splitting. | 🟢 | Accept — no changes needed. |
| A2 | Opening ▸ Game Plan ▸ Choosing running vs blocking game | The 8%+ pip-lead threshold for switching to pure race, and the game-plan taxonomy (race, prime/holding, back game) are canonical. | 🟢 | Accept — no changes needed. |
| A3 | Early Game ▸ Anchor Building ▸ Building an anchor in opponent home | The 20-point (opponent's 5-point) and 21-point (bar-point) rankings, and the 24-point avoidance, are standard defensive doctrine. | 🟢 | Accept — no changes needed. |
| A4 | (aggregate) | All doubling-cube thresholds (25% take point, ~50% double in volatile play, ~80% too good), anchor choices, prime escapes, blitz math (25/36 dance), and bear-off safety principles are correct. | 🟢 | Accept — no changes needed. |

## Axis B — Prose & delivery (the UX of comprehension)

All conditions are precise, searchable, and board-matchable in <2s. All stealth lines stand alone and are glanceable (max 41 chars of 50-char budget). TLDR headlines are strong and headline-ready. One minor prose note in Priming phrasing.

| # | location | Finding | Severity | Disposition |
|---|----------|---------|:--------:|-------------|
| B1 | Early Game ▸ Priming ▸ Building a prime (4+ consecutive points) ▸ detailed | Phrasing "Build from the 5/6-point backward to the bar (7) and 4-point" is slightly awkward — the logical sequence is bar (7), 6, 5, 4, 3, 2, but the wording suggests 5/6 first, then bar, then 4. The intent is clear (build a 6-prime), but could tighten to "Build points bar (7), 6, 5, 4, 3, 2 to lock opponent." | 🟡 | Recommend (not shipped — prose polish, no strategic change). |
| B2 | (aggregate) | All 11 stealth line 0s (dashboard headlines) are crisp and self-contained: "3-1, 4-2, 6-1: make a point", "20-point = golden anchor", "Take if winning 25%+", "Play safe bear-off; opponent holds anchor". No cryptic or over-dense lines. | 🟢 | Accept — no changes needed. |
| B3 | (aggregate) | Stealth line lengths: max 41 chars (bearing off), min 17 chars (doubling cube); all ≤50 budget, all glanceable as half-second reads. | 🟢 | Accept — no changes needed. |

**Axis B: 4/5.** Prose is clear and glanceable throughout; one minor phrasing note in priming that doesn't affect play.

## Axis C — Model fit

The Phase → Category → Condition decomposition and context filter (pip-lead/trail) align perfectly with backgammon's actual decision structure.

| # | model element | Finding | Disposition |
|---|---------------|---------|-------------|
| C1 | Phases | Opening → Early Game → Mid-Game → End-Game = a natural arc through the game's flow. No forced, empty, or missing phases. | Accept |
| C2 | Categories | Opening (plays vs plan), Early (anchors vs hitting vs priming), Mid-Game (back game vs blitz vs cube vs race), End-Game (bearing off vs gammon prevention). All meaningful, roughly MECE, and driven by the game's decision branches. | Accept |
| C3 | Conditions | All 11 conditions partition the decision space cleanly without overlaps or gaps. Alphabetical condition sort within each category does not scatter any intended reading order — conditions within a category are situational, not sequential. | Accept |
| C4 | Context filter | "Ahead in pip count?" (pip-lead/trail) is the single dominant decision branch in backgammon. Splits the game into offensive (race when ahead) vs defensive (anchor, blitz, back game when behind) play. Perfect fit. No unforced context usage; no missing binary state. | Accept |
| C5 | Collapse density | Opening: 2 rows, Early: 4 rows, Mid-Game: 5 rows (max), End-Game: 3 rows. All ≤8 budget; stealth one-screen glance is safe. | Accept |
| C6 | Tags | 8 non-TLDR tags are authored (Offense, Defense, Economy, Closing). The category split already reflects these (hitting/priming = offense, anchoring/back game = defense, opening/game plan/race/doubling = economy, bearing off/gammon prevention = closing). Tag rendering would be redundant with categories; not a gap. | Backlog |

**Axis C: 5/5.** Model is a perfect structural fit.

---

## Shipped this pass

**None.** The seed is strategically optimal, deliverable, and well-fit to the platform. No bounded fixes needed.

## Recommended (not shipped — model/UX changes)

- **B1 prose note**: Tighten Priming detailed phrasing (no schema/code change; content polish). This is low priority — the current phrasing conveys the right idea and does not mislead play.

---

## Notes

- This seed is **ship-grade as-is**. All three axes are strong. The advice is grounded in competitive theory and correctly filed; the prose is clear and glanceable; and the game's decision structure maps perfectly to the Phase/Category/Context model.
- The context filter (pip-lead/trail) is the most elegant example in the 20-seed library of a binary state that truly drives game strategy — it's worth noting as a exemplar for future game design.
- One observation for the cross-cutting backlog: Backgammon is a **perfect model for the current platform** — if future games struggle with model fit, re-audit Backgammon as a reference point for the "things going right" case.
