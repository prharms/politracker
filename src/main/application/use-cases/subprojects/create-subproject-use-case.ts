import type { SubprojectRepositoryPort } from '../../ports/subproject-repository-port'
import type { SubprojectDto, NewSubprojectInput } from '../../../../shared/dtos/subproject-dto'

/** Creates a new subproject under a project. */
export class CreateSubprojectUseCase {
  /** Construct with a subproject repository. */
  constructor(private readonly repo: SubprojectRepositoryPort) {}

  /** Execute: create and return the new subproject. */
  execute(input: NewSubprojectInput): SubprojectDto {
    return this.repo.create(input)
  }
}
