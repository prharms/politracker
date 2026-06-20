import type {
  SubprojectDto,
  NewSubprojectInput,
  UpdateSubprojectInput
} from '../../../shared/dtos/subproject-dto'

/** Repository port for subproject persistence. */
export interface SubprojectRepositoryPort {
  /** Return all subprojects, optionally filtered by project. */
  list(projectId?: string): SubprojectDto[]

  /** Persist a new subproject and return the saved row. */
  create(input: NewSubprojectInput): SubprojectDto

  /** Update subproject fields and return the updated row. */
  update(id: string, input: UpdateSubprojectInput): SubprojectDto

  /** Delete a subproject. Returns false if it has tasks. */
  delete(id: string): { deleted: boolean; reason?: string }

  /** Return the number of tasks linked to the given subproject. */
  countTasksBySubproject(subprojectId: string): number
}
