import type {
  SubjectDto,
  NewSubjectInput,
  UpdateSubjectInput
} from '../../../shared/dtos/subject-dto'

/** Repository port for subject persistence. */
export interface SubjectRepositoryPort {
  /** Return all subjects ordered by name, with project name joined. */
  listAll(): SubjectDto[]

  /** Return all subjects for a given project. */
  listByProject(projectId: string): SubjectDto[]

  /** Return a single subject by id, or null if not found. */
  findById(id: string): SubjectDto | null

  /** Persist a new subject and return it. */
  create(input: NewSubjectInput): SubjectDto

  /** Update a subject and return the updated record. */
  update(id: string, input: UpdateSubjectInput): SubjectDto

  /** Delete a subject by id. */
  delete(id: string): void

  /** Return the number of tasks linked to this subject. */
  countTasks(id: string): number
}
