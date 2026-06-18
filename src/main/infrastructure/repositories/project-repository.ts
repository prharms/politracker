import { eq, count } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { randomUUID } from 'crypto'
import { projects, clients, subjects } from '../db/schema'
import type { ProjectRepositoryPort } from '../../application/ports/project-repository-port'
import type {
  ProjectDto,
  NewProjectInput,
  UpdateProjectInput
} from '../../../shared/dtos/project-dto'
import type { ProjectType, ProjectStatus } from '../../../shared/constants'

type ProjectRow = {
  id: string
  clientId: string
  clientName: string | null
  name: string
  type: string
  status: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

/** Map a raw join row to a ProjectDto. */
function toDto(row: ProjectRow): ProjectDto {
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

/** Select shape for project + client join. */
function projectSelectShape() {
  return {
    id: projects.id,
    clientId: projects.clientId,
    clientName: clients.name,
    name: projects.name,
    type: projects.type,
    status: projects.status,
    notes: projects.notes,
    createdAt: projects.createdAt,
    updatedAt: projects.updatedAt
  }
}

/** Drizzle-backed repository implementing ProjectRepositoryPort. */
export class ProjectRepository implements ProjectRepositoryPort {
  /** Construct with a Drizzle database instance. */
  constructor(private readonly db: BetterSQLite3Database) {}

  /** Return all projects ordered by name with client name joined. */
  listAll(): ProjectDto[] {
    const rows = this.db
      .select(projectSelectShape())
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .orderBy(projects.name)
      .all()
    return rows.map(toDto)
  }

  /** Return a single project by id with client name, or null if not found. */
  findById(id: string): ProjectDto | null {
    const row = this.db
      .select(projectSelectShape())
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .where(eq(projects.id, id))
      .get()
    return row ? toDto(row as ProjectRow) : null
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

  /** Update a project and return the updated record. */
  update(id: string, input: UpdateProjectInput): ProjectDto {
    const current = this.findById(id)
    if (!current) throw new Error(`Project record not found: ${id}`)
    const now = new Date().toISOString()
    this.db
      .update(projects)
      .set({
        name: input.name ?? current.name,
        type: input.type ?? current.type,
        status: input.status ?? current.status,
        notes: input.notes !== undefined ? input.notes : current.notes,
        updatedAt: now
      })
      .where(eq(projects.id, id))
      .run()
    return this.findById(id)!
  }

  /** Delete a project by id. */
  delete(id: string): void {
    this.db.delete(projects).where(eq(projects.id, id)).run()
  }

  /** Return the number of subjects linked to this project. */
  countSubjects(id: string): number {
    const result = this.db
      .select({ value: count() })
      .from(subjects)
      .where(eq(subjects.projectId, id))
      .get()
    return result?.value ?? 0
  }
}
