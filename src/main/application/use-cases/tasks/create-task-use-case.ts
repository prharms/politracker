import { validateTaskTitle } from '../../../domain/task'
import type { TaskRepositoryPort } from '../../ports/task-repository-port'
import type { TaskDto, NewTaskInput } from '../../../../shared/dtos/task-dto'

/** Create a new task. */
export class CreateTaskUseCase {
  /** Construct with a task repository port. */
  constructor(private readonly repo: TaskRepositoryPort) {}

  /** Validate input, persist the task, and return the enriched row. */
  execute(input: NewTaskInput): TaskDto {
    validateTaskTitle(input.title)
    if (!input.projectId.trim()) throw new Error('Project id must not be empty')
    if (!input.subprojectId.trim()) throw new Error('Subproject id must not be empty')
    if (!input.dueDate) throw new Error('Due date is required')
    return this.repo.create(input)
  }
}
