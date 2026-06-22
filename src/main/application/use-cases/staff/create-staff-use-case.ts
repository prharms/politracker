import { validateStaffName } from '../../../domain/staff'
import type { StaffRepositoryPort } from '../../ports/staff-repository-port'
import type { StaffDto, NewStaffInput } from '../../../../shared/dtos/staff-dto'

/** Create a new staff member. */
export class CreateStaffUseCase {
  /** Construct with a staff repository port. */
  constructor(private readonly repo: StaffRepositoryPort) {}

  /** Validate input, persist a new staff record, and return it. */
  execute(input: NewStaffInput): StaffDto {
    validateStaffName(input.name)
    return this.repo.create(input)
  }
}
