import type { SubjectRepositoryPort } from '../../ports/subject-repository-port'
import type { SubjectDto, NewSubjectInput } from '../../../../shared/dtos/subject-dto'

/** Create a new subject under a project. */
export class CreateSubjectUseCase {
  /** Construct with a subject repository port. */
  constructor(private readonly repo: SubjectRepositoryPort) {}

  /** Validate input, persist a new subject, and return it. */
  execute(input: NewSubjectInput): SubjectDto {
    if (!input.name.trim()) throw new Error('Subject name must not be empty')
    if (!input.projectId.trim()) throw new Error('Project id must not be empty')
    return this.repo.create(input)
  }
}
