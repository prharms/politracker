/** Valid project types. */
export declare const PROJECT_TYPES: readonly [
  'Candidate Campaign',
  'Ballot Measure',
  'Legislative Advocacy',
  'Background Research'
]
export type ProjectType = (typeof PROJECT_TYPES)[number]
/** Valid project statuses. */
export declare const PROJECT_STATUSES: readonly ['Active', 'Complete', 'Archived']
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]
/** Valid subject types. */
export declare const SUBJECT_TYPES: readonly ['Individual', 'Organization', 'Measure']
export type SubjectType = (typeof SUBJECT_TYPES)[number]
/** Valid subject statuses. */
export declare const SUBJECT_STATUSES: readonly ['Active', 'Inactive', 'Archived']
export type SubjectStatus = (typeof SUBJECT_STATUSES)[number]
/** Valid staff statuses. */
export declare const STAFF_STATUSES: readonly ['Active', 'Inactive']
export type StaffStatus = (typeof STAFF_STATUSES)[number]
/** Valid deliverable types. */
export declare const DELIVERABLE_TYPES: readonly ['Report', 'Memo', 'Other']
export type DeliverableType = (typeof DELIVERABLE_TYPES)[number]
/** Valid deliverable statuses. */
export declare const DELIVERABLE_STATUSES: readonly ['Draft', 'In Review', 'Final']
export type DeliverableStatus = (typeof DELIVERABLE_STATUSES)[number]
/** Valid task types. */
export declare const TASK_TYPES: readonly ['Research', 'Document']
export type TaskType = (typeof TASK_TYPES)[number]
/** Valid research task statuses. */
export declare const RESEARCH_STATUSES: readonly ['Backlog', 'In Progress', 'Review', 'Closed']
export type ResearchStatus = (typeof RESEARCH_STATUSES)[number]
/** Valid document task statuses. */
export declare const DOCUMENT_STATUSES: readonly ['Draft', 'In Review', 'Final']
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number]
/** All valid task statuses (union of research and document). */
export declare const TASK_STATUSES: readonly [
  'Backlog',
  'In Progress',
  'Review',
  'Closed',
  'Draft',
  'In Review',
  'Final'
]
export type TaskStatus = (typeof TASK_STATUSES)[number]
/** Valid task priorities. */
export declare const TASK_PRIORITIES: readonly ['Low', 'Normal', 'High', 'Urgent']
export type TaskPriority = (typeof TASK_PRIORITIES)[number]
/** Valid research and task categories. */
export declare const TASK_CATEGORIES: readonly [
  'Finance',
  'Voting Record',
  'Personal History',
  'Legal',
  'Public Statements',
  'Associations',
  'Other'
]
export type TaskCategory = (typeof TASK_CATEGORIES)[number]
