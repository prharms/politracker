/** Valid project types. */
export const PROJECT_TYPES = [
  'Candidate Campaign',
  'Ballot Measure',
  'Legislative Advocacy',
  'Background Research'
] as const

export type ProjectType = (typeof PROJECT_TYPES)[number]

/** Valid project statuses. */
export const PROJECT_STATUSES = ['Active', 'Complete', 'Archived'] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

/** Valid subject types. */
export const SUBJECT_TYPES = ['Individual', 'Organization', 'Measure'] as const
export type SubjectType = (typeof SUBJECT_TYPES)[number]

/** Valid subject statuses. */
export const SUBJECT_STATUSES = ['Active', 'Inactive', 'Archived'] as const
export type SubjectStatus = (typeof SUBJECT_STATUSES)[number]

/** Valid staff statuses. */
export const STAFF_STATUSES = ['Active', 'Inactive'] as const
export type StaffStatus = (typeof STAFF_STATUSES)[number]

/** Valid deliverable types. */
export const DELIVERABLE_TYPES = ['Report', 'Memo', 'Other'] as const
export type DeliverableType = (typeof DELIVERABLE_TYPES)[number]

/** Valid deliverable statuses. */
export const DELIVERABLE_STATUSES = ['Draft', 'In Review', 'Final'] as const
export type DeliverableStatus = (typeof DELIVERABLE_STATUSES)[number]

/** Valid task types. */
export const TASK_TYPES = ['Research', 'Document'] as const
export type TaskType = (typeof TASK_TYPES)[number]

/** Valid research task statuses. */
export const RESEARCH_STATUSES = ['Backlog', 'In Progress', 'Review', 'Closed'] as const
export type ResearchStatus = (typeof RESEARCH_STATUSES)[number]

/** Valid document task statuses. */
export const DOCUMENT_STATUSES = ['Draft', 'In Review', 'Final'] as const
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number]

/** All valid task statuses (union of research and document). */
export const TASK_STATUSES = [...RESEARCH_STATUSES, ...DOCUMENT_STATUSES] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

/** Valid task priorities. */
export const TASK_PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'] as const
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

/** Valid research and task categories. */
export const TASK_CATEGORIES = [
  'Finance',
  'Voting Record',
  'Personal History',
  'Legal',
  'Public Statements',
  'Associations',
  'Other'
] as const

export type TaskCategory = (typeof TASK_CATEGORIES)[number]
