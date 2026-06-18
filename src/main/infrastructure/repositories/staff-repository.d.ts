import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type { StaffRepositoryPort } from '../../application/ports/staff-repository-port'
import type { StaffDto, NewStaffInput } from '../../../shared/dtos/staff-dto'
/** Drizzle-backed repository implementing StaffRepositoryPort. */
export declare class StaffRepository implements StaffRepositoryPort {
  private readonly db
  /** Construct with a Drizzle database instance. */
  constructor(db: BetterSQLite3Database)
  /** Return all staff records ordered by name. */
  listAll(): StaffDto[]
  /** Return a single staff record by id, or null if not found. */
  findById(id: string): StaffDto | null
  /** Persist a new staff record and return it. */
  create(input: NewStaffInput): StaffDto
}
