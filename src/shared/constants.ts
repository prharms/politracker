/** Valid project types. */
export const PROJECT_TYPES = [
  'Candidate Campaign',
  'Ballot Measure',
  'Legislative Advocacy',
  'Background Research'
] as const

export type ProjectType = (typeof PROJECT_TYPES)[number]

/** Valid project statuses. */
export const PROJECT_STATUSES = ['Active', 'Complete', 'Inactive'] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

/** Valid staff statuses. */
export const STAFF_STATUSES = ['Active', 'Inactive'] as const
export type StaffStatus = (typeof STAFF_STATUSES)[number]

/** Valid deliverable types. */
export const DELIVERABLE_TYPES = ['Report', 'Memo', 'Other'] as const
export type DeliverableType = (typeof DELIVERABLE_TYPES)[number]

/** Valid deliverable statuses. */
export const DELIVERABLE_STATUSES = ['Draft', 'In Review', 'Final'] as const
export type DeliverableStatus = (typeof DELIVERABLE_STATUSES)[number]

/** Valid task statuses. */
export const TASK_STATUSES = ['Inactive', 'In Progress', 'Review', 'Complete'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

/** Valid subproject statuses. */
export const SUBPROJECT_STATUSES = ['Active', 'Complete', 'Inactive'] as const
export type SubprojectStatus = (typeof SUBPROJECT_STATUSES)[number]

/** Valid task priorities. */
export const TASK_PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'] as const
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

/** Valid task scope values - describes the size and shape of the research assignment. */
export const TASK_SCOPES = [
  'Single Level 2',
  'Multiple Level 2',
  'Single Level 1',
  'Multiple Level 1',
  'Full Memo',
  'Full Report',
  'Video Grid',
  'Other Appendix',
  'A.1 Level 1',
  'Summary of Findings'
] as const

export type TaskScope = (typeof TASK_SCOPES)[number]
