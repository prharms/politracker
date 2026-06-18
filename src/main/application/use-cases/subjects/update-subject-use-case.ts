import type { SubjectRepositoryPort } from '../../ports/subject-repository-port'
import type { SubjectDto, UpdateSubjectInput } from '../../../../shared/dtos/subject-dto'

/** Update a subject's fields. */
export class UpdateSubjectUseCase {
  /** Construct with a subject repository port. */
  constructor(private readonly repo: SubjectRepositoryPort) {}

  /** Validate input, apply update, and return the updated record. */
  execute(id: string, input: UpdateSubjectInput): SubjectDto {
    if (!id.trim()) throw new Error('Subject id must not be empty')
    if (input.name !== undefined && !input.name.trim()) {
      throw new Error('Subject name must not be empty')
    }
    return this.repo.update(id, input)
  }
}
