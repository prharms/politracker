import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type { ProjectRepositoryPort } from '../../application/ports/project-repository-port'
import type { ProjectDto, NewProjectInput } from '../../../shared/dtos/project-dto'
/** Drizzle-backed repository implementing ProjectRepositoryPort. */
export declare class ProjectRepository implements ProjectRepositoryPort {
  private readonly db
  /** Construct with a Drizzle database instance. */
  constructor(db: BetterSQLite3Database)
  /** Return all projects ordered by name with client name joined. */
  listAll(): ProjectDto[]
  /** Return a single project by id with client name, or null if not found. */
  findById(id: string): ProjectDto | null
  /** Persist a new project and return it with joined client name. */
  create(input: NewProjectInput): ProjectDto
  /** Map a raw join row to a ProjectDto. */
  private toDto
}
