import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type { TaskRepositoryPort } from '../../application/ports/task-repository-port'
import type { TaskDto, TaskListFilters, NewTaskInput } from '../../../shared/dtos/task-dto'
/** Drizzle-backed repository implementing TaskRepositoryPort. */
export declare class TaskRepository implements TaskRepositoryPort {
  private readonly db
  /** Construct with a Drizzle database instance. */
  constructor(db: BetterSQLite3Database)
  /** Return enriched task rows matching the given filters. */
  list(filters: TaskListFilters): TaskDto[]
  /** Return a single enriched task row by id, or null if not found. */
  findById(id: string): TaskDto | null
  /** Persist a new task and return the enriched row. */
  create(input: NewTaskInput): TaskDto
  /** Update the status (and closedAt) of a task and return the updated enriched row. */
  updateStatus(id: string, status: string, closedAt: string | null): TaskDto
}
