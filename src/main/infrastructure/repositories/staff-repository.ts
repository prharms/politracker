import { eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { randomUUID } from 'crypto'
import { staff } from '../db/schema'
import type { StaffRepositoryPort } from '../../application/ports/staff-repository-port'
import type { StaffDto, NewStaffInput, UpdateStaffInput } from '../../../shared/dtos/staff-dto'
import { deriveInitials } from '../../../shared/utils/derive-initials'

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
      initials: input.initials ?? deriveInitials(input.name),
      status: input.status,
      createdAt: new Date().toISOString()
    }
    this.db.insert(staff).values(record).run()
    return record
  }

  /** Update a staff member's name and/or initials and return the updated record. */
  update(id: string, input: UpdateStaffInput): StaffDto {
    const current = this.findById(id)
    if (!current) throw new Error(`Staff record not found: ${id}`)
    const name = input.name ?? current.name
    const initials = input.initials ?? (input.name ? deriveInitials(input.name) : current.initials)
    this.db.update(staff).set({ name, initials }).where(eq(staff.id, id)).run()
    return { ...current, name, initials }
  }

  /** Update a staff member's active status and return the updated record. */
  updateStatus(id: string, status: 'Active' | 'Inactive'): StaffDto {
    this.db.update(staff).set({ status }).where(eq(staff.id, id)).run()
    const updated = this.findById(id)
    if (!updated) throw new Error(`Staff record not found: ${id}`)
    return updated
  }

  /** Delete a staff member by id. */
  delete(id: string): void {
    this.db.delete(staff).where(eq(staff.id, id)).run()
  }
}
