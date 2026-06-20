import type { Config } from 'drizzle-kit'
import path from 'path'

const defaultDb = path.join(
  process.env['LOCALAPPDATA'] ?? process.env['HOME'] ?? '.',
  'Politicket',
  'data',
  'politicket.db'
)

export default {
  schema: './src/main/infrastructure/db/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env['POLITICKET_DB_PATH'] ?? defaultDb
  }
} satisfies Config
