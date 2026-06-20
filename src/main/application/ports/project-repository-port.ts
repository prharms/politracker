import type {
  ProjectDto,
  NewProjectInput,
  UpdateProjectInput
} from '../../../shared/dtos/project-dto'

/** Repository port for project persistence. */
export interface ProjectRepositoryPort {
  /** Return all projects ordered by name, with client name joined. */
  listAll(): ProjectDto[]

  /** Return a single project by id with client name, or null if not found. */
  findById(id: string): ProjectDto | null

  /** Persist a new project and return it with joined client name. */
  create(input: NewProjectInput): ProjectDto

  /** Update a project and return the updated record. */
  update(id: string, input: UpdateProjectInput): ProjectDto

  /** Delete a project by id. */
  delete(id: string): void

  /** Return the number of subjects linked to this project. */
  countSubjects(id: string): number
}
