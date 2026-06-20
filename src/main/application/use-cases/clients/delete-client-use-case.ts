import type { ClientRepositoryPort } from '../../ports/client-repository-port'
import type { DeleteClientResult } from '../../../../shared/dtos/client-dto'

/** Delete a client if they have no linked projects. */
export class DeleteClientUseCase {
  /** Construct with a client repository port. */
  constructor(private readonly repo: ClientRepositoryPort) {}

  /** Check for linked projects and delete if none exist. */
  execute(id: string): DeleteClientResult {
    if (!id.trim()) throw new Error('Client id must not be empty')
    const projectCount = this.repo.countProjects(id)
    if (projectCount > 0) return { deleted: false, projectCount }
    this.repo.delete(id)
    return { deleted: true, projectCount: 0 }
  }
}
