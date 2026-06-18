import type { ProjectDto, NewProjectInput } from '../../../shared/dtos/project-dto'

/** Repository port for project persistence. */
export interface ProjectRepositoryPort {
  /** Return all projects ordered by name, with client name joined. */
  listAll(): ProjectDto[]

  /** Return a single project by id with client name, or null if not found. */
  findById(id: string): ProjectDto | null

  /** Persist a new project and return it with joined client name. */
  create(input: NewProjectInput): ProjectDto
}
