/** A subproject row as returned to the renderer. */
export interface SubprojectDto {
  id: string
  projectId: string
  name: string
  createdAt: string
}

/** Fields required to create a new subproject. */
export interface NewSubprojectInput {
  projectId: string
  name: string
}

/** Fields that can be updated on a subproject. */
export interface UpdateSubprojectInput {
  name: string
}

/** Result returned by a delete subproject operation. */
export interface DeleteSubprojectResult {
  deleted: boolean
  reason?: string
}
