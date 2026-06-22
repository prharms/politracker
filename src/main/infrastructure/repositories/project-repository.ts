import { eq, count } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { randomUUID } from 'crypto'
import { projects, tasks } from '../db/schema'
import { ProjectNotFoundError } from '../../domain/errors'
import type { ProjectRepositoryPort } from '../../application/ports/project-repository-port'
import type {
  ProjectDto,
  NewProjectInput,
  UpdateProjectInput
} from '../../../shared/dtos/project-dto'
import type { ProjectType, ProjectStatus } from '../../../shared/constants'

type ProjectRow = {
  id: string
  name: string
  type: string
  status: string
  dueDate: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

/** Map a raw row to a ProjectDto. */
function toDto(row: ProjectRow): ProjectDto {
  return {
    id: row.id,
    name: row.name,
    type: row.type as ProjectType,
    status: row.status as ProjectStatus,
    dueDate: row.dueDate,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

/** Drizzle-backed repository implementing ProjectRepositoryPort. */
export class ProjectRepository implements ProjectRepositoryPort {
  /** Construct with a Drizzle database instance. */
  constructor(private readonly db: BetterSQLite3Database) {}

  /** Return all projects ordered by name. */
  listAll(): ProjectDto[] {
    const rows = this.db.select().from(projects).orderBy(projects.name).all() as ProjectRow[]
    return rows.map(toDto)
  }

  /** Return a single project by id, or null if not found. */
  findById(id: string): ProjectDto | null {
    const row = this.db.select().from(projects).where(eq(projects.id, id)).get() as
      | ProjectRow
      | undefined
    return row ? toDto(row) : null
  }

  /** Persist a new project and return it. */
  create(input: NewProjectInput): ProjectDto {
    const now = new Date().toISOString()
    const id = randomUUID()
    this.db
      .insert(projects)
      .values({
        id,
        name: input.name,
        type: input.type,
        status: input.status,
        dueDate: input.dueDate,
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
    if (!current) throw new ProjectNotFoundError(id)
    const now = new Date().toISOString()
    this.db
      .update(projects)
      .set({
        name: input.name ?? current.name,
        type: input.type ?? current.type,
        status: input.status ?? current.status,
        dueDate: input.dueDate ?? current.dueDate,
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

  /** Return the number of tasks linked to this project. */
  countTasks(id: string): number {
    const result = this.db
      .select({ value: count() })
      .from(tasks)
      .where(eq(tasks.projectId, id))
      .get()
    return result?.value ?? 0
  }
}
