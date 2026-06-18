import type { SubjectType, SubjectStatus } from '../constants'

/** Presentation-safe view of a subject. */
export interface SubjectDto {
  id: string
  projectId: string
  projectName: string
  name: string
  type: SubjectType
  status: SubjectStatus
  notes: string | null
  createdAt: string
}

/** Fields required to create a new subject. */
export interface NewSubjectInput {
  projectId: string
  name: string
  type: SubjectType
  status: SubjectStatus
  notes?: string
}

/** Fields that can be updated on a subject. */
export interface UpdateSubjectInput {
  name?: string
  type?: SubjectType
  status?: SubjectStatus
  notes?: string
}

/** Result returned by a delete subject operation. */
export interface DeleteSubjectResult {
  deleted: boolean
  taskCount: number
}
