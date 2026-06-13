# CLAUDE.md

**Quick-start guide for Claude Code**

---

## Project Overview

**Tabletop Strategy Companion** — local-first, mobile-first PWA. Glanceable board game strategy at the physical table. Reactive state machine: Phase → Category → Condition → Strategy.

**Tech Stack**: SolidJS, TypeScript, Vite, Tailwind CSS 4, `@sqlite.org/sqlite-wasm` (Worker + OPFS), Zod, `vite-plugin-pwa` (workbox), `@solidjs/router`

**Deployment**: Cloudflare Pages — https://tabletop-companion.pages.dev

**Full product spec**: `/home/spark343/github/tabletop-strategy-companion-spec.md`

---

## Quick Start Commands

```bash
npm run dev          # dev server (Vite, port 5173)
npm test             # unit tests (Vitest)
npm run check        # build + test
npm run build        # tsc + vite build
npm run lint         # ESLint
```

**See**: `.claude/QUICK_START.md` for full reference

---

## Key Docs

- **Common Mistakes**: `.claude/COMMON_MISTAKES.md` ⚠️
- **Architecture**: `.claude/ARCHITECTURE_MAP.md`
- **Quick Start**: `.claude/QUICK_START.md`
- **Engineering Passes**: `ENGINEERING_PASSES.md` — reusable autonomous-agent prompts (structural refactor, security, testing, seed authoring, strategy + UX validation)
- **Retros**: `retro/` — dated strategy/UX validation records (Pass 5 output); start at `retro/README.md`

---

## Current State

App is fully implemented and deployed.

- All 3 views live: GameLibrary, PreGameDashboard, LiveCompanion
- SQLite layer complete: ORM, Worker client, test client (Vite alias), seed loader
- Study ↔ Stealth mode toggle wired end-to-end
- 20 game seeds bundled (`data/seeds/*.json`), Zod-validated in CI; all 20 audited via Pass 5 (`retro/`)
- Phase nav: `arc` stepper (default) or `nav_style: 'modes'` free-select tabs for loop games (e.g. battleship's search↔target)
- Non-TLDR tags render as badges; optional per-strategy `order` sort key; stealth collapses each phase to TLDR-only with a "show all" toggle and a ≤8 collapsed-row budget (enforced in `schema.test`)
- Unit suite green (101 tests: lib + components + db + views + seed/glanceability/budget guards), build clean

To **add a new game**: drop `data/seeds/<game-id>.json`, run `npm test`, commit. Full loop: ENGINEERING_PASSES.md §4.

To **validate a game's strategy + UX**: run ENGINEERING_PASSES.md §5 (Pass 5) — audits three axes (strategic optimality, prose/delivery, model fit), writes a dated retro to `retro/`, ships bounded seed fixes, opens issues for model-level changes.

---

**Last Updated**: 2026-06-13
