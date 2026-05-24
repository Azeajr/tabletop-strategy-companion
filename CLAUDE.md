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
npm test             # unit tests (Vitest — 10 tests)
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

---

## Current State

App is fully implemented and deployed.

- All 3 views live: GameLibrary, PreGameDashboard, LiveCompanion
- SQLite layer complete: ORM, Worker client, test client (Vite alias), seed loader
- Study ↔ Stealth mode toggle wired end-to-end
- Catan seed data bundled (16 strategies, 4 phases, context filters)
- 10 tests passing, build clean

To add a new game: drop `data/seeds/<game-id>.json`, run `npm test`, commit.

---

**Last Updated**: 2026-05-23
