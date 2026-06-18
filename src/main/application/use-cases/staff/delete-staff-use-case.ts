import type { StaffRepositoryPort } from '../../ports/staff-repository-port'
import type { TaskRepositoryPort } from '../../ports/task-repository-port'
import type { DeleteStaffResult } from '../../../../shared/dtos/staff-dto'

/** Delete a staff member if they have no assigned tasks. */
export class DeleteStaffUseCase {
  /** Construct with staff and task repository ports. */
  constructor(
    private readonly staffRepo: StaffRepositoryPort,
    private readonly taskRepo: TaskRepositoryPort
  ) {}

  /** Check for assigned tasks and delete if none exist. */
  execute(id: string): DeleteStaffResult {
    if (!id.trim()) throw new Error('Staff id must not be empty')
    const taskCount = this.taskRepo.countByStaff(id)
    if (taskCount > 0) return { deleted: false, taskCount }
    this.staffRepo.delete(id)
    return { deleted: true, taskCount: 0 }
  }
}
