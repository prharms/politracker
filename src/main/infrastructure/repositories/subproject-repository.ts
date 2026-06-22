import { eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { subprojects, tasks } from '../db/schema'
import type { SubprojectRepositoryPort } from '../../application/ports/subproject-repository-port'
import type {
  SubprojectDto,
  NewSubprojectInput,
  UpdateSubprojectInput
} from '../../../shared/dtos/subproject-dto'
import { randomUUID } from 'crypto'

type SubprojectRow = {
  id: string
  projectId: string
  name: string
  dueDate: string | null
  createdAt: string
}

/** Drizzle-backed SQLite repository for subprojects. */
export class SubprojectRepository implements SubprojectRepositoryPort {
  /** Construct with a Drizzle database instance. */
  constructor(private readonly db: BetterSQLite3Database) {}

  /** Return all subprojects, optionally filtered by project. */
  list(projectId?: string): SubprojectDto[] {
    const rows = projectId
      ? (this.db
          .select()
          .from(subprojects)
          .where(eq(subprojects.projectId, projectId))
          .orderBy(subprojects.name)
          .all() as SubprojectRow[])
      : (this.db.select().from(subprojects).orderBy(subprojects.name).all() as SubprojectRow[])
    return rows.map(toDto)
  }

  /** Persist a new subproject and return the saved row. */
  create(input: NewSubprojectInput): SubprojectDto {
    const now = new Date().toISOString()
    const row: SubprojectRow = {
      id: randomUUID(),
      projectId: input.projectId,
      name: input.name,
      dueDate: input.dueDate ?? null,
      createdAt: now
    }
    this.db.insert(subprojects).values(row).run()
    return toDto(row)
  }

  /** Update subproject fields and return the updated row. */
  update(id: string, input: UpdateSubprojectInput): SubprojectDto {
    const current = this.db.select().from(subprojects).where(eq(subprojects.id, id)).get() as
      | SubprojectRow
      | undefined
    if (!current) throw new Error(`Subproject ${id} not found`)
    this.db
      .update(subprojects)
      .set({
        name: input.name ?? current.name,
        dueDate: input.dueDate !== undefined ? input.dueDate : current.dueDate
      })
      .where(eq(subprojects.id, id))
      .run()
    const updated = this.db
      .select()
      .from(subprojects)
      .where(eq(subprojects.id, id))
      .get() as SubprojectRow
    return toDto(updated)
  }

  /** Delete a subproject. Returns false with reason if it has tasks. */
  delete(id: string): { deleted: boolean; reason?: string } {
    const taskCount = this.countTasksBySubproject(id)
    if (taskCount > 0) {
      return {
        deleted: false,
        reason: `Cannot delete: ${taskCount} task(s) assigned to this subproject`
      }
    }
    this.db.delete(subprojects).where(eq(subprojects.id, id)).run()
    return { deleted: true }
  }

  /** Return the number of tasks linked to the given subproject. */
  countTasksBySubproject(subprojectId: string): number {
    return this.db
      .select({ id: tasks.id })
      .from(tasks)
      .where(eq(tasks.subprojectId, subprojectId))
      .all().length
  }
}

/** Map a raw subproject row to a SubprojectDto. */
function toDto(row: SubprojectRow): SubprojectDto {
  return {
    id: row.id,
    projectId: row.projectId,
    name: row.name,
    dueDate: row.dueDate,
    createdAt: row.createdAt
  }
}
