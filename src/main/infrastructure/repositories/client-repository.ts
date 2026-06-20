import { eq, count } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { randomUUID } from 'crypto'
import { clients, projects } from '../db/schema'
import type { ClientRepositoryPort } from '../../application/ports/client-repository-port'
import type { ClientDto, NewClientInput, UpdateClientInput } from '../../../shared/dtos/client-dto'

/** Drizzle-backed repository implementing ClientRepositoryPort. */
export class ClientRepository implements ClientRepositoryPort {
  /** Construct with a Drizzle database instance. */
  constructor(private readonly db: BetterSQLite3Database) {}

  /** Return all clients ordered by name. */
  listAll(): ClientDto[] {
    return this.db.select().from(clients).orderBy(clients.name).all() as ClientDto[]
  }

  /** Return a single client by id, or null if not found. */
  findById(id: string): ClientDto | null {
    const result = this.db.select().from(clients).where(eq(clients.id, id)).get()
    return (result as ClientDto) ?? null
  }

  /** Persist a new client and return it. */
  create(input: NewClientInput): ClientDto {
    const record: ClientDto = {
      id: randomUUID(),
      name: input.name,
      createdAt: new Date().toISOString()
    }
    this.db.insert(clients).values(record).run()
    return record
  }

  /** Update a client's name and return the updated record. */
  update(id: string, input: UpdateClientInput): ClientDto {
    this.db.update(clients).set({ name: input.name }).where(eq(clients.id, id)).run()
    const updated = this.findById(id)
    if (!updated) throw new Error(`Client record not found: ${id}`)
    return updated
  }

  /** Delete a client by id. */
  delete(id: string): void {
    this.db.delete(clients).where(eq(clients.id, id)).run()
  }

  /** Return the number of projects linked to this client. */
  countProjects(id: string): number {
    const result = this.db
      .select({ value: count() })
      .from(projects)
      .where(eq(projects.clientId, id))
      .get()
    return result?.value ?? 0
  }
}
