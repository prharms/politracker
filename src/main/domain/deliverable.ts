import type { DeliverableType, DeliverableStatus } from '../../shared/constants'

/**
 * Core deliverable domain entity.
 * Carries only the deliverable's own persistent properties - no joined project name.
 */
export interface Deliverable {
  readonly id: string
  readonly projectId: string
  readonly parentDeliverableId: string | null
  readonly subprojectId: string | null
  readonly type: DeliverableType
  readonly title: string
  readonly status: DeliverableStatus
  readonly dueDate: string | null
  readonly notes: string | null
  readonly createdAt: string
  readonly updatedAt: string
}
