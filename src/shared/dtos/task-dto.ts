import type { TaskType, TaskStatus, TaskPriority, TaskCategory } from '../constants'

/** Enriched task row - joins staff name, subject name, project name, deliverable title. */
export interface TaskDto {
  id: string
  title: string
  taskType: TaskType
  category: TaskCategory
  status: TaskStatus
  priority: TaskPriority
  subjectId: string
  subjectName: string
  projectId: string
  projectName: string
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

/** Optional filters for listing tasks. */
export interface TaskListFilters {
  staffId?: string
  projectId?: string
  deliverableId?: string
  status?: TaskStatus
}

/** Fields required to create a new task. */
export interface NewTaskInput {
  subjectId: string
  staffId?: string
  taskType: TaskType
  deliverableId?: string
  parentDocumentId?: string
  sortOrder?: number
  title: string
  category: TaskCategory
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  notes?: string
}

/** Fields that can be updated on a task. */
export interface UpdateTaskInput {
  title?: string
  staffId?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  category?: TaskCategory
  dueDate?: string | null
  notes?: string | null
}

/** Result returned by a delete task operation. */
export interface DeleteTaskResult {
  deleted: boolean
}
