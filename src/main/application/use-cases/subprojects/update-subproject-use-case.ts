import type { SubprojectRepositoryPort } from '../../ports/subproject-repository-port'
import type { SubprojectDto, UpdateSubprojectInput } from '../../../../shared/dtos/subproject-dto'

/** Updates an existing subproject's name. */
export class UpdateSubprojectUseCase {
  /** Construct with a subproject repository. */
  constructor(private readonly repo: SubprojectRepositoryPort) {}

  /** Execute: update and return the subproject. */
  execute(id: string, input: UpdateSubprojectInput): SubprojectDto {
    return this.repo.update(id, input)
  }
}
