import { eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { randomUUID } from 'crypto'
import { staff } from '../db/schema'
import type { StaffRepositoryPort } from '../../application/ports/staff-repository-port'
import type { StaffDto, NewStaffInput } from '../../../shared/dtos/staff-dto'

/** Drizzle-backed repository implementing StaffRepositoryPort. */
export class StaffRepository implements StaffRepositoryPort {
  /** Construct with a Drizzle database instance. */
  constructor(private readonly db: BetterSQLite3Database) {}

  /** Return all staff records ordered by name. */
  listAll(): StaffDto[] {
    return this.db.select().from(staff).orderBy(staff.name).all() as StaffDto[]
  }

  /** Return a single staff record by id, or null if not found. */
  findById(id: string): StaffDto | null {
    const result = this.db.select().from(staff).where(eq(staff.id, id)).get()
    return (result as StaffDto) ?? null
  }

  /** Persist a new staff record and return it. */
  create(input: NewStaffInput): StaffDto {
    const record: StaffDto = {
      id: randomUUID(),
      name: input.name,
      status: input.status,
      createdAt: new Date().toISOString()
    }
    this.db
      .insert(staff)
      .values({ ...record, createdAt: record.createdAt })
      .run()
    return record
  }
}
