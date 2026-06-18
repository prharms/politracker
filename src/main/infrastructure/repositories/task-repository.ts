import { eq, and } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { randomUUID } from 'crypto'
import { tasks, subjects, projects, staff, deliverables } from '../db/schema'
import type { TaskRepositoryPort } from '../../application/ports/task-repository-port'
import type { TaskDto, TaskListFilters, NewTaskInput } from '../../../shared/dtos/task-dto'
import type { TaskType, TaskStatus, TaskPriority, TaskCategory } from '../../../shared/constants'

type TaskRow = {
  id: string
  title: string
  taskType: string
  category: string
  status: string
  priority: string
  subjectId: string
  subjectName: string | null
  projectId: string | null
  projectName: string | null
  staffId: string | null
  staffName: string | null
  deliverableId: string | null
  deliverableTitle: string | null
  parentDocumentId: string | null
  sortOrder: number | null
  dueDate: string | null
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
      .leftJoin(subjects, eq(tasks.subjectId, subjects.id))
      .leftJoin(projects, eq(subjects.projectId, projects.id))
      .leftJoin(staff, eq(tasks.staffId, staff.id))
      .leftJoin(deliverables, eq(tasks.deliverableId, deliverables.id))

    const rows = conditions.length > 0 ? query.where(and(...conditions)).all() : query.all()

    return (rows as TaskRow[]).map(toDto)
  }

  /** Return a single enriched task row by id, or null if not found. */
  findById(id: string): TaskDto | null {
    const row = this.db
      .select(taskSelectShape())
      .from(tasks)
      .leftJoin(subjects, eq(tasks.subjectId, subjects.id))
      .leftJoin(projects, eq(subjects.projectId, projects.id))
      .leftJoin(staff, eq(tasks.staffId, staff.id))
      .leftJoin(deliverables, eq(tasks.deliverableId, deliverables.id))
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
        subjectId: input.subjectId,
        staffId: input.staffId ?? null,
        taskType: input.taskType,
        deliverableId: input.deliverableId ?? null,
        parentDocumentId: input.parentDocumentId ?? null,
        sortOrder: input.sortOrder ?? null,
        title: input.title,
        category: input.category,
        status: input.status,
        priority: input.priority,
        dueDate: input.dueDate ?? null,
        notes: input.notes ?? null,
        closedAt: null,
        createdAt: now,
        updatedAt: now
      })
      .run()
    return this.findById(id)!
  }

  /** Update the status (and closedAt) of a task and return the updated enriched row. */
  updateStatus(id: string, status: string, closedAt: string | null): TaskDto {
    const now = new Date().toISOString()
    this.db.update(tasks).set({ status, closedAt, updatedAt: now }).where(eq(tasks.id, id)).run()
    return this.findById(id)!
  }
}

/** Column selection shape for all join queries. */
function taskSelectShape() {
  return {
    id: tasks.id,
    title: tasks.title,
    taskType: tasks.taskType,
    category: tasks.category,
    status: tasks.status,
    priority: tasks.priority,
    subjectId: tasks.subjectId,
    subjectName: subjects.name,
    projectId: subjects.projectId,
    projectName: projects.name,
    staffId: tasks.staffId,
    staffName: staff.name,
    deliverableId: tasks.deliverableId,
    deliverableTitle: deliverables.title,
    parentDocumentId: tasks.parentDocumentId,
    sortOrder: tasks.sortOrder,
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
    conditions.push(eq(subjects.projectId, filters.projectId))
  }
  if (filters.deliverableId) {
    conditions.push(eq(tasks.deliverableId, filters.deliverableId))
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
    taskType: row.taskType as TaskType,
    category: row.category as TaskCategory,
    status: row.status as TaskStatus,
    priority: row.priority as TaskPriority,
    subjectId: row.subjectId,
    subjectName: row.subjectName ?? '',
    projectId: row.projectId ?? '',
    projectName: row.projectName ?? '',
    staffId: row.staffId,
    staffName: row.staffName,
    deliverableId: row.deliverableId,
    deliverableTitle: row.deliverableTitle,
    parentDocumentId: row.parentDocumentId,
    sortOrder: row.sortOrder,
    dueDate: row.dueDate,
    notes: row.notes,
    closedAt: row.closedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}
