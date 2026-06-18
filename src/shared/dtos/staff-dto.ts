/** Presentation-safe view of a staff member. */
export interface StaffDto {
  id: string
  name: string
  initials: string
  status: 'Active' | 'Inactive'
  createdAt: string
}

/** Fields required to create a new staff member. */
export interface NewStaffInput {
  name: string
  initials?: string
  status: 'Active' | 'Inactive'
}

/** Fields that can be updated on a staff member. */
export interface UpdateStaffInput {
  name?: string
  initials?: string
}

/** Fields required to update a staff member's active status. */
export interface UpdateStaffStatusInput {
  status: 'Active' | 'Inactive'
}

/** Result returned by the delete staff operation. */
export interface DeleteStaffResult {
  deleted: boolean
  taskCount: number
}
