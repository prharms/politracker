import type { TaskRepositoryPort } from '../../ports/task-repository-port'
import type { TaskDto, NewTaskInput } from '../../../../shared/dtos/task-dto'

/** Create a new task. */
export class CreateTaskUseCase {
  /** Construct with a task repository port. */
  constructor(private readonly repo: TaskRepositoryPort) {}

  /** Validate input, persist a new task, and return the enriched record. */
  execute(input: NewTaskInput): TaskDto {
    if (!input.title.trim()) throw new Error('Task title must not be empty')
    if (!input.subjectId.trim()) throw new Error('Subject id must not be empty')
    return this.repo.create(input)
  }
}
