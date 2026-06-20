import type { SubprojectRepositoryPort } from '../../ports/subproject-repository-port'
import type { SubprojectDto } from '../../../../shared/dtos/subproject-dto'

/** Returns all subprojects, optionally filtered by project. */
export class ListSubprojectsUseCase {
  /** Construct with a subproject repository. */
  constructor(private readonly repo: SubprojectRepositoryPort) {}

  /** Execute: list subprojects, optionally filtered by projectId. */
  execute(projectId?: string): SubprojectDto[] {
    return this.repo.list(projectId)
  }
}
