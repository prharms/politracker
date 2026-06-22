import { validateProjectName } from '../../../domain/project'
import type { ProjectRepositoryPort } from '../../ports/project-repository-port'
import type { ProjectDto, UpdateProjectInput } from '../../../../shared/dtos/project-dto'

/** Update a project's fields. */
export class UpdateProjectUseCase {
  /** Construct with a project repository port. */
  constructor(private readonly repo: ProjectRepositoryPort) {}

  /** Validate input, apply update, and return the updated record. */
  execute(id: string, input: UpdateProjectInput): ProjectDto {
    if (!id.trim()) throw new Error('Project id must not be empty')
    if (input.name !== undefined) validateProjectName(input.name)
    return this.repo.update(id, input)
  }
}
