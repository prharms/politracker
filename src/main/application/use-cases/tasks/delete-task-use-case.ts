import type { TaskRepositoryPort } from '../../ports/task-repository-port'
import type { DeleteTaskResult } from '../../../../shared/dtos/task-dto'

/** Delete a task by id. */
export class DeleteTaskUseCase {
  /** Construct with a task repository port. */
  constructor(private readonly repo: TaskRepositoryPort) {}

  /** Delete the task and return the result. */
  execute(id: string): DeleteTaskResult {
    if (!id.trim()) throw new Error('Task id must not be empty')
    this.repo.delete(id)
    return { deleted: true }
  }
}
