// SQLite Wasm + OPFS query layer — stubs to be implemented
// All queries return typed results matching schema.ts

export type GameRow = {
  game_id: string
  game_name: string
  game_description: string
  filter_1_label: string | null
  filter_1_yes_context: string | null
  filter_1_no_context: string | null
  filter_2_label: string | null
  filter_2_yes_context: string | null
  filter_2_no_context: string | null
}

export type StrategyRow = {
  game_id: string
  phase: string
  category: string
  condition: string
  strategy_detailed: string
  strategy_stealth: string[] // stored as JSON string in SQLite, parsed on read
  tags: string[]             // stored as JSON string in SQLite, parsed on read
  context: string | null
}

// TODO: initialize SQLite Wasm + OPFS, run seed UPSERTs, expose query functions
export const db = {
  getAllGames: (): GameRow[] => [],
  getGame: (_gameId: string): GameRow | null => null,
  getStrategies: (_gameId: string, _phase: string, _context?: string | null): StrategyRow[] => [],
  getTLDR: (_gameId: string): StrategyRow[] => [],
}
