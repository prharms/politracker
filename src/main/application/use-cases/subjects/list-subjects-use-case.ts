import type { SubjectRepositoryPort } from '../../ports/subject-repository-port'
import type { SubjectDto } from '../../../../shared/dtos/subject-dto'

/** Return subjects, optionally filtered by project. */
export class ListSubjectsUseCase {
  /** Construct with a subject repository port. */
  constructor(private readonly repo: SubjectRepositoryPort) {}

  /** Return all subjects, or only those for a given project if projectId is provided. */
  execute(projectId?: string): SubjectDto[] {
    if (projectId) return this.repo.listByProject(projectId)
    return this.repo.listAll()
  }
}
