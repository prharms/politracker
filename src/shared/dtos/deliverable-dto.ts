import type { DeliverableType, DeliverableStatus } from '../constants'

/** Presentation-safe view of a deliverable. */
export interface DeliverableDto {
  id: string
  projectId: string
  projectName: string
  parentDeliverableId: string | null
  groupId: string | null
  subjectId: string | null
  type: DeliverableType
  title: string
  status: DeliverableStatus
  dueDate: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

/** Fields required to create a new deliverable. */
export interface NewDeliverableInput {
  projectId: string
  parentDeliverableId?: string
  groupId?: string
  subjectId?: string
  type: DeliverableType
  title: string
  status: DeliverableStatus
  dueDate?: string
  notes?: string
}
