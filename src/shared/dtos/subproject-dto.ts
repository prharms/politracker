/** A subproject row as returned to the renderer. */
export interface SubprojectDto {
  id: string
  projectId: string
  name: string
  /** Null for the auto-created "None" subproject, which inherits due date from the parent project. */
  dueDate: string | null
  createdAt: string
}

/** Fields required to create a new subproject. */
export interface NewSubprojectInput {
  projectId: string
  name: string
  /** Optional - auto-created "None" subproject omits this and inherits from the parent project. */
  dueDate?: string
}

/** Fields that can be updated on a subproject. */
export interface UpdateSubprojectInput {
  name?: string
  dueDate?: string | null
}

/** Result returned by a delete subproject operation. */
export interface DeleteSubprojectResult {
  deleted: boolean
  reason?: string
}
