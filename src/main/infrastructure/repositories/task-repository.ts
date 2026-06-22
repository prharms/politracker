import { eq, and, count } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { randomUUID } from 'crypto'
import { tasks, projects, subprojects, staff } from '../db/schema'
import type { TaskRepositoryPort } from '../../application/ports/task-repository-port'
import type {
  TaskDto,
  TaskListFilters,
  NewTaskInput,
  UpdateTaskInput
} from '../../../shared/dtos/task-dto'
import type { TaskStatus, TaskPriority, TaskScope } from '../../../shared/constants'

type TaskRow = {
  id: string
  title: string
  scope: string
  status: string
  priority: string
  projectId: string
  projectName: string | null
  subprojectId: string
  subprojectName: string | null
  staffId: string | null
  staffName: string | null
  dueDate: string
  notes: string | null
  closedAt: string | null
  createdAt: string
  updatedAt: string
}

/** Drizzle-backed repository implementing TaskRepositoryPort. */
export class TaskRepository implements TaskRepositoryPort {
  /** Construct with a Drizzle database instance. */
  constructor(private readonly db: BetterSQLite3Database) {}

  /** Return enriched task rows matching the given filters. */
  list(filters: TaskListFilters): TaskDto[] {
    const conditions = buildConditions(filters)

    const query = this.db
      .select(taskSelectShape())
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .leftJoin(subprojects, eq(tasks.subprojectId, subprojects.id))
      .leftJoin(staff, eq(tasks.staffId, staff.id))

    const rows = conditions.length > 0 ? query.where(and(...conditions)).all() : query.all()

    return (rows as TaskRow[]).map(toDto)
  }

  /** Return a single enriched task row by id, or null if not found. */
  findById(id: string): TaskDto | null {
    const row = this.db
      .select(taskSelectShape())
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .leftJoin(subprojects, eq(tasks.subprojectId, subprojects.id))
      .leftJoin(staff, eq(tasks.staffId, staff.id))
      .where(eq(tasks.id, id))
      .get() as TaskRow | undefined

    return row ? toDto(row) : null
  }

  /** Persist a new task and return the enriched row. */
  create(input: NewTaskInput): TaskDto {
    const now = new Date().toISOString()
    const id = randomUUID()
    this.db
      .insert(tasks)
      .values({
        id,
        projectId: input.projectId,
        subprojectId: input.subprojectId,
        staffId: input.staffId ?? null,
        title: input.title,
        scope: input.scope,
        status: input.status,
        priority: input.priority,
        dueDate: input.dueDate,
        notes: input.notes ?? null,
        closedAt: null,
        createdAt: now,
        updatedAt: now
      })
      .run()
    return this.findById(id)!
  }

  /** Update task fields and return the updated enriched row. */
  update(id: string, input: UpdateTaskInput): TaskDto {
    const now = new Date().toISOString()
    const current = this.findById(id)
    if (!current) throw new Error(`Task record not found: ${id}`)
    this.db
      .update(tasks)
      .set(buildTaskPatch(input, current, now))
      .where(eq(tasks.id, id))
      .run()
    return this.findById(id)!
  }

  /** Update the status (and closedAt) of a task and return the updated enriched row. */
  updateStatus(id: string, status: string, closedAt: string | null): TaskDto {
    const now = new Date().toISOString()
    this.db.update(tasks).set({ status, closedAt, updatedAt: now }).where(eq(tasks.id, id)).run()
    return this.findById(id)!
  }

  /** Delete a task by id. */
  delete(id: string): void {
    this.db.delete(tasks).where(eq(tasks.id, id)).run()
  }

  /** Return the total number of tasks assigned to a staff member. */
  countByStaff(staffId: string): number {
    return countByStaff(this.db, staffId)
  }
}

/** Column selection shape for all join queries. */
function taskSelectShape() {
  return {
    id: tasks.id,
    title: tasks.title,
    scope: tasks.scope,
    status: tasks.status,
    priority: tasks.priority,
    projectId: tasks.projectId,
    projectName: projects.name,
    subprojectId: tasks.subprojectId,
    subprojectName: subprojects.name,
    staffId: tasks.staffId,
    staffName: staff.name,
    dueDate: tasks.dueDate,
    notes: tasks.notes,
    closedAt: tasks.closedAt,
    createdAt: tasks.createdAt,
    updatedAt: tasks.updatedAt
  }
}

/** Build WHERE conditions from filter params. */
function buildConditions(filters: TaskListFilters) {
  const conditions = []
  if (filters.staffId) {
    conditions.push(eq(tasks.staffId, filters.staffId))
  }
  if (filters.projectId) {
    conditions.push(eq(tasks.projectId, filters.projectId))
  }
  if (filters.status) {
    conditions.push(eq(tasks.status, filters.status))
  }
  return conditions
}

/** Map a raw join row to a TaskDto. */
function toDto(row: TaskRow): TaskDto {
  return {
    id: row.id,
    title: row.title,
    scope: row.scope as TaskScope,
    status: row.status as TaskStatus,
    priority: row.priority as TaskPriority,
    projectId: row.projectId,
    projectName: row.projectName ?? '',
    subprojectId: row.subprojectId,
    subprojectName: row.subprojectName,
    staffId: row.staffId,
    staffName: row.staffName,
    dueDate: row.dueDate,
    notes: row.notes,
    closedAt: row.closedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

/** Return true when the given status represents a completed state. */
function isCompleteStatus(status: string): boolean {
  return status === 'Complete'
}

/** Build the column patch object for a task update. */
function buildTaskPatch(input: UpdateTaskInput, current: TaskDto, now: string) {
  const closedAt = input.status && isCompleteStatus(input.status) ? now : current.closedAt
  return {
    title: input.title ?? current.title,
    scope: input.scope ?? current.scope,
    staffId: input.staffId !== undefined ? input.staffId : current.staffId,
    status: input.status ?? current.status,
    priority: input.priority ?? current.priority,
    dueDate: input.dueDate ?? current.dueDate,
    notes: input.notes !== undefined ? input.notes : current.notes,
    closedAt,
    updatedAt: now
  }
}

/** Return the total number of tasks assigned to a staff member. */
function countByStaff(db: BetterSQLite3Database, staffId: string): number {
  const result = db.select({ value: count() }).from(tasks).where(eq(tasks.staffId, staffId)).get()
  return result?.value ?? 0
}
