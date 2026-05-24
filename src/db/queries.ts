// Query layer — thin re-export from db/index.ts for backwards compatibility.
// Prefer importing directly from './index' in new code.
export { db, dbReady } from './index'
export type { Game as GameRow, Strategy as StrategyRow } from '../types/domain'
