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
npm run dev          # dev server (Vite)
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

---

**Last Updated**: 2026-05-23
