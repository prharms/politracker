import type { DeliverableRepositoryPort } from '../../ports/deliverable-repository-port'
import type { DeliverableDto } from '../../../../shared/dtos/deliverable-dto'

/** Retrieves deliverables for a project or all projects. */
export class ListDeliverablesUseCase {
  /** Construct with a deliverable repository port. */
  constructor(private readonly repo: DeliverableRepositoryPort) {}

  /** Return all deliverables for the given project, or all deliverables if no projectId given. */
  execute(projectId?: string): DeliverableDto[] {
    if (projectId) {
      return this.repo.listByProject(projectId)
    }
    return this.repo.listAll()
  }
}
