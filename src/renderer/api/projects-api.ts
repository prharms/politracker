import type {
  ProjectDto,
  NewProjectInput,
  UpdateProjectInput,
  DeleteProjectResult
} from '../../shared/dtos/project-dto'

/** Fetch all projects. */
export function apiListProjects(): Promise<ProjectDto[]> {
  return window.api.projects.list()
}

/** Create a new project. */
export function apiCreateProject(input: NewProjectInput): Promise<ProjectDto> {
  return window.api.projects.create(input)
}

/** Update a project. */
export function apiUpdateProject(id: string, input: UpdateProjectInput): Promise<ProjectDto> {
  return window.api.projects.update(id, input)
}

/** Delete a project. */
export function apiDeleteProject(id: string): Promise<DeleteProjectResult> {
  return window.api.projects.delete(id)
}

/** Legacy object API - kept for use-filter-options hook. */
export const projectsApi = {
  list: apiListProjects
}
