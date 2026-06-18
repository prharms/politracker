import type { ProjectRepositoryPort } from '../../ports/project-repository-port'
import type { ProjectDto, NewProjectInput } from '../../../../shared/dtos/project-dto'

/** Create a new project under a client. */
export class CreateProjectUseCase {
  /** Construct with a project repository port. */
  constructor(private readonly repo: ProjectRepositoryPort) {}

  /** Validate input, persist a new project, and return it. */
  execute(input: NewProjectInput): ProjectDto {
    if (!input.name.trim()) throw new Error('Project name must not be empty')
    if (!input.clientId.trim()) throw new Error('Client id must not be empty')
    return this.repo.create(input)
  }
}
