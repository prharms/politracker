import type { TaskDto, TaskListFilters } from './dtos/task-dto'
import type { StaffDto } from './dtos/staff-dto'
import type { ProjectDto } from './dtos/project-dto'

/** Typed API for task IPC channels. */
export interface TasksAPI {
  list: (filters?: TaskListFilters) => Promise<TaskDto[]>
}

/** Typed API for staff IPC channels. */
export interface StaffAPI {
  list: () => Promise<StaffDto[]>
}

/** Typed API for project IPC channels. */
export interface ProjectsAPI {
  list: () => Promise<ProjectDto[]>
}

/** Typed window.api interface - all IPC channels exposed by preload. */
export interface ElectronAPI {
  tasks: TasksAPI
  staff: StaffAPI
  projects: ProjectsAPI
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
