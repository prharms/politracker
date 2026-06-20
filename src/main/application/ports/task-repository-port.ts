import type {
  TaskDto,
  TaskListFilters,
  NewTaskInput,
  UpdateTaskInput
} from '../../../shared/dtos/task-dto'

/** Repository port for task persistence. */
export interface TaskRepositoryPort {
  /** Return enriched task rows matching the given filters, ordered by priority then createdAt. */
  list(filters: TaskListFilters): TaskDto[]

  /** Return a single enriched task row by id, or null if not found. */
  findById(id: string): TaskDto | null

  /** Persist a new task and return the enriched row. */
  create(input: NewTaskInput): TaskDto

  /** Update task fields and return the updated enriched row. */
  update(id: string, input: UpdateTaskInput): TaskDto

  /** Update task status only and return the updated enriched row. */
  updateStatus(id: string, status: string, closedAt: string | null): TaskDto

  /** Delete a task by id. */
  delete(id: string): void

  /** Return the number of tasks assigned to the given staff member. */
  countByStaff(staffId: string): number
}
