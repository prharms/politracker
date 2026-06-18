import type { Config } from 'drizzle-kit'

export default {
  schema: './src/main/infrastructure/db/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env['POLITICKET_DB_PATH'] ?? './politicket.db'
  }
} satisfies Config
