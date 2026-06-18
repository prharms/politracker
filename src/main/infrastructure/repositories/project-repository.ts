import { eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { randomUUID } from 'crypto'
import { projects, clients } from '../db/schema'
import type { ProjectRepositoryPort } from '../../application/ports/project-repository-port'
import type { ProjectDto, NewProjectInput } from '../../../shared/dtos/project-dto'
import type { ProjectType, ProjectStatus } from '../../../shared/constants'

/** Drizzle-backed repository implementing ProjectRepositoryPort. */
export class ProjectRepository implements ProjectRepositoryPort {
  /** Construct with a Drizzle database instance. */
  constructor(private readonly db: BetterSQLite3Database) {}

  /** Return all projects ordered by name with client name joined. */
  listAll(): ProjectDto[] {
    const rows = this.db
      .select({
        id: projects.id,
        clientId: projects.clientId,
        clientName: clients.name,
        name: projects.name,
        type: projects.type,
        status: projects.status,
        notes: projects.notes,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .orderBy(projects.name)
      .all()

    return rows.map(this.toDto)
  }

  /** Return a single project by id with client name, or null if not found. */
  findById(id: string): ProjectDto | null {
    const row = this.db
      .select({
        id: projects.id,
        clientId: projects.clientId,
        clientName: clients.name,
        name: projects.name,
        type: projects.type,
        status: projects.status,
        notes: projects.notes,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .where(eq(projects.id, id))
      .get()

    return row ? this.toDto(row) : null
  }

  /** Persist a new project and return it with joined client name. */
  create(input: NewProjectInput): ProjectDto {
    const now = new Date().toISOString()
    const id = randomUUID()
    this.db
      .insert(projects)
      .values({
        id,
        clientId: input.clientId,
        name: input.name,
        type: input.type,
        status: input.status,
        notes: input.notes ?? null,
        createdAt: now,
        updatedAt: now
      })
      .run()
    return this.findById(id)!
  }

  /** Map a raw join row to a ProjectDto. */
  private toDto(row: {
    id: string
    clientId: string
    clientName: string | null
    name: string
    type: string
    status: string
    notes: string | null
    createdAt: string
    updatedAt: string
  }): ProjectDto {
    return {
      id: row.id,
      clientId: row.clientId,
      clientName: row.clientName ?? '',
      name: row.name,
      type: row.type as ProjectType,
      status: row.status as ProjectStatus,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }
  }
}
