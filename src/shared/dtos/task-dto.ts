import type { TaskStatus, TaskPriority, TaskScope } from '../constants'

/** Enriched task row - joins staff name, project name, subproject name. */
export interface TaskDto {
  id: string
  title: string
  scope: TaskScope
  status: TaskStatus
  priority: TaskPriority
  projectId: string
  projectName: string
  subprojectId: string | null
  subprojectName: string | null
  staffId: string | null
  staffName: string | null
  dueDate: string | null
  notes: string | null
  closedAt: string | null
  createdAt: string
  updatedAt: string
}

/** Optional filters for listing tasks. */
export interface TaskListFilters {
  staffId?: string
  projectId?: string
  status?: TaskStatus
}

/** Fields required to create a new task. */
export interface NewTaskInput {
  projectId: string
  subprojectId?: string
  staffId?: string
  title: string
  scope: TaskScope
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  notes?: string
}

/** Fields that can be updated on a task. */
export interface UpdateTaskInput {
  title?: string
  scope?: TaskScope
  staffId?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string | null
  notes?: string | null
}

/** Result returned by a delete task operation. */
export interface DeleteTaskResult {
  deleted: boolean
}
