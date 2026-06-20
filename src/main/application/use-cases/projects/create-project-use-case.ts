import type { ProjectRepositoryPort } from '../../ports/project-repository-port'
import type { SubprojectRepositoryPort } from '../../ports/subproject-repository-port'
import type { ProjectDto, NewProjectInput } from '../../../../shared/dtos/project-dto'

/** Create a new project under a client. */
export class CreateProjectUseCase {
  /** Construct with project and subproject repository ports. */
  constructor(
    private readonly repo: ProjectRepositoryPort,
    private readonly subprojectRepo: SubprojectRepositoryPort
  ) {}

  /** Validate input, persist a new project, auto-create its default subproject, and return it. */
  execute(input: NewProjectInput): ProjectDto {
    if (!input.name.trim()) throw new Error('Project name must not be empty')
    if (!input.clientId.trim()) throw new Error('Client id must not be empty')
    const project = this.repo.create(input)
    this.subprojectRepo.create({ projectId: project.id, name: 'None' })
    return project
  }
}
