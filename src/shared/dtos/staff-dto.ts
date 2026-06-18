/** Presentation-safe view of a staff member. */
export interface StaffDto {
  id: string
  name: string
  status: 'Active' | 'Inactive'
  createdAt: string
}

/** Fields required to create a new staff member. */
export interface NewStaffInput {
  name: string
  status: 'Active' | 'Inactive'
}

/** Fields required to update a staff member's active status. */
export interface UpdateStaffStatusInput {
  status: 'Active' | 'Inactive'
}
