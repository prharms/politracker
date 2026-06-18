import type { TaskRepositoryPort } from '../../ports/task-repository-port'
import type { TaskDto, TaskListFilters } from '../../../../shared/dtos/task-dto'

/** Retrieves tasks with optional filtering by staff, project, or deliverable. */
export class ListTasksUseCase {
  /** Construct with a task repository port. */
  constructor(private readonly repo: TaskRepositoryPort) {}

  /** Return enriched task rows matching the given filters. */
  execute(filters: TaskListFilters = {}): TaskDto[] {
    return this.repo.list(filters)
  }
}
