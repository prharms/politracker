import type { ProjectRepositoryPort } from '../../ports/project-repository-port'
import type { DeleteProjectResult } from '../../../../shared/dtos/project-dto'

/** Delete a project if it has no subjects. */
export class DeleteProjectUseCase {
  /** Construct with a project repository port. */
  constructor(private readonly repo: ProjectRepositoryPort) {}

  /** Check for subjects and delete if none exist. */
  execute(id: string): DeleteProjectResult {
    if (!id.trim()) throw new Error('Project id must not be empty')
    const subjectCount = this.repo.countSubjects(id)
    if (subjectCount > 0) return { deleted: false, subjectCount }
    this.repo.delete(id)
    return { deleted: true, subjectCount: 0 }
  }
}
