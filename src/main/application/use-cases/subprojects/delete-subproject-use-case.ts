import type { SubprojectRepositoryPort } from '../../ports/subproject-repository-port'
import type { DeleteSubprojectResult } from '../../../../shared/dtos/subproject-dto'

/** Deletes a subproject if it has no assigned tasks. */
export class DeleteSubprojectUseCase {
  /** Construct with a subproject repository. */
  constructor(private readonly repo: SubprojectRepositoryPort) {}

  /** Execute: delete and return the result. */
  execute(id: string): DeleteSubprojectResult {
    return this.repo.delete(id)
  }
}
