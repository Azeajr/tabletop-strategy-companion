# Common Mistakes

**⚠️ Read at session start**

---

### 1. Sorting phases alphabetically

**Symptom**: "Early Game" appears before "End-Game" because `E < E` alphabetically ties and order becomes arbitrary.
**Fix**: Always sort by the enum index: `Setup(0) → Early Game(1) → Mid-Game(2) → End-Game(3)`. Never `ORDER BY phase ASC` in SQL without a `CASE` expression mapping to these indices.

---

### 2. Expanding multiple ConditionToggles at once

**Symptom**: Two conditions open simultaneously — layout shifts, stealth single-screen lock broken.
**Fix**: `ActionAccordion` must track a single `expandedCondition` signal. Opening any toggle must close the previously open one first.

---

### 3. text-overflow: ellipsis on condition headers

**Symptom**: Long condition text truncated — strategy meaning lost (e.g., "Opponent blocks prim…").
**Fix**: All condition and category text must wrap. Container height must scale dynamically. `ellipsis` is banned per spec.

---

### 4. Forgetting `context` field in seed data

**Symptom**: Strategies that should only show for "leading" or "trailing" filter state appear regardless of InlineYesNoFilter position.
**Fix**: Set `context` to the matching `filter_N_yes/no_context` string on the Game row. Strategies with `context = null` always show — they are universal, not filter-specific.

---

### 5. session lock not wired to service worker

**Symptom**: PWA update activates mid-game, causing a reload that clears the active phase state.
**Fix**: `LiveCompanion.tsx` must post `{ type: 'SESSION_ACTIVE' }` to the service worker on mount and `{ type: 'SESSION_ENDED' }` on cleanup. The SW must reject `skipWaiting` calls while `SESSION_ACTIVE` is set.

---

### 6. iOS Safari back-swipe navigates out of game view

**Symptom**: Left-edge swipe exits the Live Companion unexpectedly.
**Fix**: This is a native WebKit gesture. `overscroll-behavior-x: none` does NOT suppress it on iOS. No reliable CSS or JS workaround. Do not attempt to block it.

---

### 7. Polling CI after a docs-only push

**Symptom**: `gh run watch` hangs or no run ever appears after committing only Markdown / `.claude/` files — waiting on a deploy that never starts.
**Fix**: `.github/workflows/deploy.yml` has a `paths` filter — it triggers only on `src/**` (excluding `src/**/*.test.*`), `public/**`, `data/seeds/**`, `index.html`, `package.json`, `package-lock.json`, `vite.config.*`, `tsconfig*`. A commit touching only root docs (`CLAUDE.md`, `ROADMAP.md`, `ENGINEERING_PASSES.md`), `retro/**`, or `.claude/**` does NOT run CI — don't poll for it. Seed edits (`data/seeds/**`) DO trigger it.

---

**Update when**: bug took >1h, could cause data loss, or repeated across sessions.

**Last Updated**: 2026-06-13
