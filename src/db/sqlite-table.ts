import { sqliteClient } from './sqlite-client'

export interface TableSchema {
  jsonFields?: string[]
}

// Identifiers are interpolated into SQL because SQLite has no bind parameter
// for them. Every call site today passes a hardcoded literal, but interpolation
// + future refactors = injection risk. Reject anything that isn't a plain
// identifier so a future caller can't pass through user input.
const IDENT_RE = /^[A-Za-z_][A-Za-z0-9_]*$/
function assertIdent(name: string): string {
  if (!IDENT_RE.test(name)) throw new Error(`Invalid SQL identifier: ${name}`)
  return name
}

function toSqlRow(obj: Record<string, unknown>, schema: TableSchema): Record<string, unknown> {
  const row = { ...obj }
  for (const f of schema.jsonFields ?? []) {
    if (f in row && row[f] != null) row[f] = JSON.stringify(row[f])
  }
  return row
}

function fromSqlRow<T>(row: Record<string, unknown>, schema: TableSchema): T {
  const result = { ...row }
  for (const f of schema.jsonFields ?? []) {
    if (result[f] != null) result[f] = JSON.parse(result[f] as string)
  }
  return result as T
}

class Query<T> {
  private readonly table: SQLiteTable<T>
  private readonly whereSql: string | null
  private readonly whereParams: unknown[]
  private orderField: string | null = null
  private orderDesc = false

  constructor(table: SQLiteTable<T>, whereSql: string | null = null, whereParams: unknown[] = []) {
    this.table = table
    this.whereSql = whereSql
    this.whereParams = whereParams
  }

  orderBy(field: string, desc = false): this {
    this.orderField = assertIdent(field)
    this.orderDesc = desc
    return this
  }

  private buildSelect(limit?: number): string {
    let sql = `SELECT * FROM "${this.table.tableName}"`
    if (this.whereSql) sql += ` WHERE ${this.whereSql}`
    if (this.orderField) sql += ` ORDER BY "${this.orderField}"${this.orderDesc ? ' DESC' : ''}`
    if (limit != null) sql += ` LIMIT ${limit}`
    return sql
  }

  toArray(): Promise<T[]> {
    return this.table._query(this.buildSelect(), this.whereParams)
  }

  async first(): Promise<T | undefined> {
    const rows = await this.table._query(this.buildSelect(1), this.whereParams)
    return rows[0]
  }

  async delete(): Promise<void> {
    const whereClause = this.whereSql ? ` WHERE ${this.whereSql}` : ''
    await sqliteClient.run(`DELETE FROM "${this.table.tableName}"${whereClause}`, this.whereParams)
  }
}

class WhereClause<T> {
  private readonly table: SQLiteTable<T>
  private readonly field: string

  constructor(table: SQLiteTable<T>, field: string) {
    this.table = table
    this.field = assertIdent(field)
  }

  equals(value: unknown): Query<T> {
    return new Query<T>(this.table, `"${this.field}" = ?`, [value])
  }
}

export class SQLiteTable<T> {
  readonly tableName: string
  private schema: TableSchema

  constructor(tableName: string, schema: TableSchema = {}) {
    this.tableName = assertIdent(tableName)
    this.schema = schema
  }

  where(field: string): WhereClause<T> {
    return new WhereClause<T>(this, field)
  }

  orderBy(field: string, desc = false): Query<T> {
    return new Query<T>(this).orderBy(field, desc)
  }

  async toArray(): Promise<T[]> {
    return this._query(`SELECT * FROM "${this.tableName}"`, [])
  }

  async get(id: number): Promise<T | undefined> {
    const rows = await this._query(`SELECT * FROM "${this.tableName}" WHERE id = ?`, [id])
    return rows[0]
  }

  private buildInsert(row: Record<string, unknown>, orReplace: boolean): { sql: string; values: unknown[] } {
    const cols = Object.keys(row).filter((k) => row[k] !== undefined).map(assertIdent)
    const values = cols.map((k) => row[k])
    const placeholders = cols.map(() => '?').join(',')
    const verb = orReplace ? 'INSERT OR REPLACE' : 'INSERT'
    const sql = `${verb} INTO "${this.tableName}" (${cols.map((c) => `"${c}"`).join(',')}) VALUES (${placeholders})`
    return { sql, values }
  }

  async add(obj: Omit<T, 'id'> | T): Promise<number> {
    const row = toSqlRow(obj as Record<string, unknown>, this.schema)
    if (row.id == null) delete row.id
    const { sql, values } = this.buildInsert(row, false)
    return (await sqliteClient.run(sql, values)).lastInsertRowid
  }

  async put(obj: T): Promise<number> {
    const row = toSqlRow(obj as Record<string, unknown>, this.schema)
    const { sql, values } = this.buildInsert(row, true)
    return (await sqliteClient.run(sql, values)).lastInsertRowid
  }

  async delete(id: number): Promise<void> {
    await sqliteClient.run(`DELETE FROM "${this.tableName}" WHERE id = ?`, [id])
  }

  async count(): Promise<number> {
    const rows = await sqliteClient.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM "${this.tableName}"`,
      [],
    )
    return rows[0]?.count ?? 0
  }

  async bulkAdd(items: (Omit<T, 'id'> | T)[]): Promise<void> {
    await this.transaction(async () => {
      for (const item of items) await this.add(item)
    })
  }

  async clear(): Promise<void> {
    await sqliteClient.run(`DELETE FROM "${this.tableName}"`, [])
  }

  async _query(sql: string, params: unknown[]): Promise<T[]> {
    const rows = await sqliteClient.query<Record<string, unknown>>(sql, params)
    return rows.map((r) => fromSqlRow<T>(r, this.schema))
  }

  transaction(fn: () => Promise<void>): Promise<void> {
    return sqliteClient.transaction(fn)
  }
}
