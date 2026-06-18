import type { StaffRepositoryPort } from '../../ports/staff-repository-port'
import type { StaffDto } from '../../../../shared/dtos/staff-dto'

/** Update a staff member's active/inactive status. */
export class UpdateStaffStatusUseCase {
  /** Construct with a staff repository port. */
  constructor(private readonly repo: StaffRepositoryPort) {}

  /** Toggle the status of the given staff record and return the updated record. */
  execute(id: string, status: 'Active' | 'Inactive'): StaffDto {
    if (!id.trim()) {
      throw new Error('Staff id must not be empty')
    }
    return this.repo.updateStatus(id, status)
  }
}
