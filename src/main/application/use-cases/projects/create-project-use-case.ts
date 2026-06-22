import { validateProjectName } from '../../../domain/project'
import type { ProjectRepositoryPort } from '../../ports/project-repository-port'
import type { SubprojectRepositoryPort } from '../../ports/subproject-repository-port'
import type { ProjectDto, NewProjectInput } from '../../../../shared/dtos/project-dto'

/** Create a new project and auto-create its default "None" subproject. */
export class CreateProjectUseCase {
  /** Construct with project and subproject repository ports. */
  constructor(
    private readonly repo: ProjectRepositoryPort,
    private readonly subprojectRepo: SubprojectRepositoryPort
  ) {}

  /** Validate input, persist a new project, auto-create its default subproject, and return it. */
  execute(input: NewProjectInput): ProjectDto {
    validateProjectName(input.name)
    if (!input.dueDate) throw new Error('Due date is required')
    const project = this.repo.create(input)
    this.subprojectRepo.create({ projectId: project.id, name: 'None' })
    return project
  }
}
