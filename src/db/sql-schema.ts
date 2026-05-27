export const SCHEMA = `
CREATE TABLE IF NOT EXISTS games (
  game_id TEXT PRIMARY KEY,
  game_name TEXT NOT NULL,
  game_description TEXT NOT NULL,
  phases TEXT NOT NULL DEFAULT '[]',
  filter_1_label TEXT,
  filter_1_yes_context TEXT,
  filter_1_no_context TEXT,
  filter_2_label TEXT,
  filter_2_yes_context TEXT,
  filter_2_no_context TEXT
);
CREATE TABLE IF NOT EXISTS strategies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id TEXT NOT NULL,
  phase TEXT NOT NULL,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  strategy_detailed TEXT NOT NULL,
  strategy_stealth TEXT NOT NULL,
  tags TEXT NOT NULL,
  context TEXT
);
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_strategies_game_id ON strategies(game_id);
CREATE INDEX IF NOT EXISTS idx_strategies_phase_game ON strategies(phase, game_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_strategies_upsert
  ON strategies(game_id, phase, category, condition);
`

export const ADDITIVE_MIGRATIONS: readonly string[] = [
  "ALTER TABLE games ADD COLUMN phases TEXT NOT NULL DEFAULT '[]'",
]

export const ALL_TABLES = ['games', 'strategies', 'meta'] as const
