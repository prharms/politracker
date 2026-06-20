import type { SubjectRepositoryPort } from '../../ports/subject-repository-port'
import type { DeleteSubjectResult } from '../../../../shared/dtos/subject-dto'

/** Delete a subject if it has no assigned tasks. */
export class DeleteSubjectUseCase {
  /** Construct with a subject repository port. */
  constructor(private readonly repo: SubjectRepositoryPort) {}

  /** Check for assigned tasks and delete if none exist. */
  execute(id: string): DeleteSubjectResult {
    if (!id.trim()) throw new Error('Subject id must not be empty')
    const taskCount = this.repo.countTasks(id)
    if (taskCount > 0) return { deleted: false, taskCount }
    this.repo.delete(id)
    return { deleted: true, taskCount: 0 }
  }
}
