import { eq, count } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { randomUUID } from 'crypto'
import { subjects, projects, tasks } from '../db/schema'
import type { SubjectRepositoryPort } from '../../application/ports/subject-repository-port'
import type {
  SubjectDto,
  NewSubjectInput,
  UpdateSubjectInput
} from '../../../shared/dtos/subject-dto'
import type { SubjectType, SubjectStatus } from '../../../shared/constants'

type SubjectRow = {
  id: string
  projectId: string
  projectName: string | null
  name: string
  type: string
  status: string
  notes: string | null
  createdAt: string
}

/** Map a raw row to a SubjectDto. */
function toDto(row: SubjectRow): SubjectDto {
  return {
    id: row.id,
    projectId: row.projectId,
    projectName: row.projectName ?? '',
    name: row.name,
    type: row.type as SubjectType,
    status: row.status as SubjectStatus,
    notes: row.notes,
    createdAt: row.createdAt
  }
}

/** Drizzle-backed repository implementing SubjectRepositoryPort. */
export class SubjectRepository implements SubjectRepositoryPort {
  /** Construct with a Drizzle database instance. */
  constructor(private readonly db: BetterSQLite3Database) {}

  /** Return all subjects ordered by name with project name joined. */
  listAll(): SubjectDto[] {
    const rows = this.db
      .select({
        id: subjects.id,
        projectId: subjects.projectId,
        projectName: projects.name,
        name: subjects.name,
        type: subjects.type,
        status: subjects.status,
        notes: subjects.notes,
        createdAt: subjects.createdAt
      })
      .from(subjects)
      .leftJoin(projects, eq(subjects.projectId, projects.id))
      .orderBy(subjects.name)
      .all()
    return rows.map(toDto)
  }

  /** Return all subjects for a given project. */
  listByProject(projectId: string): SubjectDto[] {
    const rows = this.db
      .select({
        id: subjects.id,
        projectId: subjects.projectId,
        projectName: projects.name,
        name: subjects.name,
        type: subjects.type,
        status: subjects.status,
        notes: subjects.notes,
        createdAt: subjects.createdAt
      })
      .from(subjects)
      .leftJoin(projects, eq(subjects.projectId, projects.id))
      .where(eq(subjects.projectId, projectId))
      .orderBy(subjects.name)
      .all()
    return rows.map(toDto)
  }

  /** Return a single subject by id, or null if not found. */
  findById(id: string): SubjectDto | null {
    const rows = this.db
      .select({
        id: subjects.id,
        projectId: subjects.projectId,
        projectName: projects.name,
        name: subjects.name,
        type: subjects.type,
        status: subjects.status,
        notes: subjects.notes,
        createdAt: subjects.createdAt
      })
      .from(subjects)
      .leftJoin(projects, eq(subjects.projectId, projects.id))
      .where(eq(subjects.id, id))
      .all()
    return rows.length > 0 ? toDto(rows[0] as SubjectRow) : null
  }

  /** Persist a new subject and return it. */
  create(input: NewSubjectInput): SubjectDto {
    const now = new Date().toISOString()
    const id = randomUUID()
    this.db
      .insert(subjects)
      .values({
        id,
        projectId: input.projectId,
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

  /** Update a subject and return the updated record. */
  update(id: string, input: UpdateSubjectInput): SubjectDto {
    const current = this.findById(id)
    if (!current) throw new Error(`Subject record not found: ${id}`)
    const now = new Date().toISOString()
    this.db
      .update(subjects)
      .set({
        name: input.name ?? current.name,
        type: input.type ?? current.type,
        status: input.status ?? current.status,
        notes: input.notes !== undefined ? input.notes : current.notes,
        updatedAt: now
      })
      .where(eq(subjects.id, id))
      .run()
    return this.findById(id)!
  }

  /** Delete a subject by id. */
  delete(id: string): void {
    this.db.delete(subjects).where(eq(subjects.id, id)).run()
  }

  /** Return the number of tasks linked to this subject. */
  countTasks(id: string): number {
    const result = this.db
      .select({ value: count() })
      .from(tasks)
      .where(eq(tasks.subjectId, id))
      .get()
    return result?.value ?? 0
  }
}
