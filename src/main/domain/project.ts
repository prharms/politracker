import type { ProjectType, ProjectStatus } from '../../shared/constants'

/**
 * Core project domain entity.
 * Carries only the project's own persistent properties.
 */
export interface Project {
  readonly id: string
  readonly name: string
  readonly type: ProjectType
  readonly status: ProjectStatus
  readonly dueDate: string
  readonly notes: string | null
  readonly createdAt: string
  readonly updatedAt: string
}

/**
 * Validate a project name.
 * @throws {Error} if the name is blank after trimming
 */
export function validateProjectName(name: string): void {
  if (!name.trim()) throw new Error('Project name must not be empty')
}
