import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type { DeliverableRepositoryPort } from '../../application/ports/deliverable-repository-port'
import type { DeliverableDto, NewDeliverableInput } from '../../../shared/dtos/deliverable-dto'
/** Drizzle-backed repository implementing DeliverableRepositoryPort. */
export declare class DeliverableRepository implements DeliverableRepositoryPort {
  private readonly db
  /** Construct with a Drizzle database instance. */
  constructor(db: BetterSQLite3Database)
  /** Return all deliverables for a project with project name joined. */
  listByProject(projectId: string): DeliverableDto[]
  /** Return all deliverables across all projects. */
  listAll(): DeliverableDto[]
  /** Return a single deliverable by id, or null if not found. */
  findById(id: string): DeliverableDto | null
  /** Persist a new deliverable and return it. */
  create(input: NewDeliverableInput): DeliverableDto
  /** Execute the base join query and return raw rows. */
  private queryJoined
  /** Map a raw join row to a DeliverableDto. */
  private toDto
}
