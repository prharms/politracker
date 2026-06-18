import type { TaskDto, TaskListFilters } from '../../shared/dtos/task-dto'

/** Typed wrappers for task IPC calls. */
export const tasksApi = {
  /** Fetch all tasks matching the given filters. */
  list: (filters?: TaskListFilters): Promise<TaskDto[]> => window.api.tasks.list(filters)
}
