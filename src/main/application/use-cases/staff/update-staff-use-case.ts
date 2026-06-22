import { validateStaffName } from '../../../domain/staff'
import type { StaffRepositoryPort } from '../../ports/staff-repository-port'
import type { StaffDto, UpdateStaffInput } from '../../../../shared/dtos/staff-dto'

/** Update a staff member's name and/or initials. */
export class UpdateStaffUseCase {
  /** Construct with a staff repository port. */
  constructor(private readonly repo: StaffRepositoryPort) {}

  /** Validate input, apply the update, and return the updated record. */
  execute(id: string, input: UpdateStaffInput): StaffDto {
    if (!id.trim()) throw new Error('Staff id must not be empty')
    if (input.name !== undefined) validateStaffName(input.name)
    return this.repo.update(id, input)
  }
}
