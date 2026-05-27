import { SQLiteTable } from './sqlite-table'
import { dbReady, sqliteClient } from './sqlite-client'
import type { Game, Strategy } from '../types/domain'

interface MetaRow {
  key: string
  value: string
}

class TabletopDB {
  games = new SQLiteTable<Game>('games', { jsonFields: ['phases'] })
  strategies = new SQLiteTable<Strategy>('strategies', {
    jsonFields: ['strategy_stealth', 'tags'],
  })
  meta = new SQLiteTable<MetaRow>('meta')

  async getGame(gameId: string): Promise<Game | null> {
    const row = await this.games.where('game_id').equals(gameId).first()
    return row ?? null
  }

  async getAllGames(): Promise<Game[]> {
    return this.games.orderBy('game_name').toArray()
  }

  async getStrategies(gameId: string): Promise<Strategy[]> {
    return this.strategies.where('game_id').equals(gameId).toArray()
  }

  async upsertGame(game: Game): Promise<void> {
    await this.games.put(game)
  }

  async upsertStrategies(strategies: Omit<Strategy, 'id'>[]): Promise<void> {
    await this.strategies.bulkAdd(strategies)
  }

  transaction(fn: () => Promise<void>): Promise<void> {
    return sqliteClient.transaction(fn)
  }
}

export const db = new TabletopDB()
export type TabletopDBType = TabletopDB
export { dbReady }
