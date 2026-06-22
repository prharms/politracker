import type { ProjectRepositoryPort } from '../../ports/project-repository-port'
import type { DeleteProjectResult } from '../../../../shared/dtos/project-dto'

/** Delete a project if it has no tasks. */
export class DeleteProjectUseCase {
  /** Construct with a project repository port. */
  constructor(private readonly repo: ProjectRepositoryPort) {}

  /** Check for tasks and delete if none exist. */
  execute(id: string): DeleteProjectResult {
    if (!id.trim()) throw new Error('Project id must not be empty')
    const taskCount = this.repo.countTasks(id)
    if (taskCount > 0) return { deleted: false, taskCount }
    this.repo.delete(id)
    return { deleted: true, taskCount: 0 }
  }
}
