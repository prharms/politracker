import type { ProjectType, ProjectStatus } from '../constants'

/** Presentation-safe view of a project. */
export interface ProjectDto {
  id: string
  clientId: string
  clientName: string
  name: string
  type: ProjectType
  status: ProjectStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

/** Fields required to create a new project. */
export interface NewProjectInput {
  clientId: string
  name: string
  type: ProjectType
  status: ProjectStatus
  notes?: string
}

/** Fields that can be updated on a project. */
export interface UpdateProjectInput {
  name?: string
  type?: ProjectType
  status?: ProjectStatus
  notes?: string
}

/** Result returned by a delete project operation. */
export interface DeleteProjectResult {
  deleted: boolean
  taskCount: number
}
