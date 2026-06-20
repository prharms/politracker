import type {
  TaskDto,
  TaskListFilters,
  NewTaskInput,
  UpdateTaskInput,
  DeleteTaskResult
} from '../../shared/dtos/task-dto'

/** Fetch tasks with optional filters. */
export function apiListTasks(filters?: TaskListFilters): Promise<TaskDto[]> {
  return window.api.tasks.list(filters)
}

/** Create a new task. */
export function apiCreateTask(input: NewTaskInput): Promise<TaskDto> {
  return window.api.tasks.create(input)
}

/** Update a task. */
export function apiUpdateTask(id: string, input: UpdateTaskInput): Promise<TaskDto> {
  return window.api.tasks.update(id, input)
}

/** Delete a task. */
export function apiDeleteTask(id: string): Promise<DeleteTaskResult> {
  return window.api.tasks.delete(id)
}
