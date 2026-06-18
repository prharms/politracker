import type { StaffRepositoryPort } from '../../ports/staff-repository-port'
import type { StaffDto } from '../../../../shared/dtos/staff-dto'

/** Retrieves all staff members for display or filter dropdowns. */
export class ListStaffUseCase {
  /** Construct with a staff repository port. */
  constructor(private readonly repo: StaffRepositoryPort) {}

  /** Return all staff records ordered by name. */
  execute(): StaffDto[] {
    return this.repo.listAll()
  }
}
