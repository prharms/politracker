import type { ProjectRepositoryPort } from '../../ports/project-repository-port'
import type { ProjectDto } from '../../../../shared/dtos/project-dto'

/** Retrieves all projects for display or filter dropdowns. */
export class ListProjectsUseCase {
  /** Construct with a project repository port. */
  constructor(private readonly repo: ProjectRepositoryPort) {}

  /** Return all projects ordered by name with client name joined. */
  execute(): ProjectDto[] {
    return this.repo.listAll()
  }
}
