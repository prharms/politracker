import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import path from 'path'

/**
 * Create an in-memory SQLite database with all migrations applied.
 * Used only in tests - never imported by production code.
 */
export function createTestDatabase(): BetterSQLite3Database {
  const sqlite = new Database(':memory:')
  sqlite.pragma('foreign_keys = ON')
  const db = drizzle(sqlite) as BetterSQLite3Database
  migrate(db, { migrationsFolder: path.resolve(process.cwd(), 'migrations') })
  return db
}
