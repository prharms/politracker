import type { DeliverableDto, NewDeliverableInput } from '../../../shared/dtos/deliverable-dto'

/** Repository port for deliverable persistence. */
export interface DeliverableRepositoryPort {
  /** Return all deliverables for a project with project name joined. */
  listByProject(projectId: string): DeliverableDto[]

  /** Return all deliverables across all projects. */
  listAll(): DeliverableDto[]

  /** Return a single deliverable by id, or null if not found. */
  findById(id: string): DeliverableDto | null

  /** Persist a new deliverable and return it. */
  create(input: NewDeliverableInput): DeliverableDto
}
