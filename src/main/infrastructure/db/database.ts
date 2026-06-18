import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import path from 'path'
import fs from 'fs'
import { app } from 'electron'

/** Open (or create) the SQLite database, apply pending migrations, and return a Drizzle instance. */
export function openDatabase(): BetterSQLite3Database {
  const dbPath =
    process.env['POLITICKET_DB_PATH'] ?? path.join(app.getPath('userData'), 'data', 'politicket.db')

  fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  const db = drizzle(sqlite) as BetterSQLite3Database

  const migrationsFolder = path.join(app.getAppPath(), 'migrations')
  migrate(db, { migrationsFolder })

  return db
}
