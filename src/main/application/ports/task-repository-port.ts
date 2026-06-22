import type { TaskStatus } from '../../../shared/constants'
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

  /**
   * Update task fields and return the updated enriched row.
   * @throws {TaskNotFoundError} if the task does not exist
   */
  update(id: string, input: UpdateTaskInput): TaskDto

  /**
   * Update task status and apply the closedAt domain rule, then return the updated enriched row.
   * The repository is responsible for computing closedAt via resolveClosedAt - callers
   * must not pass closedAt explicitly.
   * @throws {TaskNotFoundError} if the task does not exist
   */
  updateStatus(id: string, status: TaskStatus): TaskDto

  /** Delete a task by id. */
  delete(id: string): void

  /** Return the number of tasks assigned to the given staff member. */
  countByStaff(staffId: string): number
}
