import type { TaskRepositoryPort } from '../../ports/task-repository-port'
import type { TaskDto, UpdateTaskInput } from '../../../../shared/dtos/task-dto'

/** Update a task's fields. */
export class UpdateTaskUseCase {
  /** Construct with a task repository port. */
  constructor(private readonly repo: TaskRepositoryPort) {}

  /** Validate input, apply update, and return the updated record. */
  execute(id: string, input: UpdateTaskInput): TaskDto {
    if (!id.trim()) throw new Error('Task id must not be empty')
    if (input.title !== undefined && !input.title.trim()) {
      throw new Error('Task title must not be empty')
    }
    return this.repo.update(id, input)
  }
}
