import type { ProjectDto } from '../../shared/dtos/project-dto'

/** Typed wrappers for project IPC calls. */
export const projectsApi = {
  /** Fetch all projects. */
  list: (): Promise<ProjectDto[]> => window.api.projects.list()
}
