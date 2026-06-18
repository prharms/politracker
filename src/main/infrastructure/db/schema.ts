import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

/** Clients - the organizations or individuals who hire the firm. */
export const clients = sqliteTable('clients', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull()
})

/** Projects - the top-level engagement, linked to a client. */
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.id),
  name: text('name').notNull(),
  type: text('type').notNull(), // ProjectType
  status: text('status').notNull(), // ProjectStatus
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

/**
 * Project groups - optional intermediate level within a project.
 * Used as contests for Candidate Campaigns and bills/issues for Legislative Advocacy.
 */
export const projectGroups = sqliteTable('project_groups', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull()
})

/**
 * Subjects - the research targets.
 * Candidates, legislators, organizations, individuals, or ballot measures.
 */
export const subjects = sqliteTable('subjects', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id),
  groupId: text('group_id').references(() => projectGroups.id),
  name: text('name').notNull(),
  type: text('type').notNull(), // SubjectType
  role: text('role'),
  status: text('status').notNull(), // SubjectStatus
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

/** Staff - the researchers and writers on the team. */
export const staff = sqliteTable('staff', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  initials: text('initials').notNull(),
  status: text('status').notNull(), // StaffStatus
  createdAt: text('created_at').notNull()
})

/**
 * Deliverables - the final work products: Reports, Memos, and Other.
 * Can be scoped to the whole project, a project group, or a specific subject.
 * Supports nesting via parent_deliverable_id (e.g. memos that roll up into a report).
 */
export const deliverables = sqliteTable('deliverables', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id),
  parentDeliverableId: text('parent_deliverable_id'),
  groupId: text('group_id').references(() => projectGroups.id),
  subjectId: text('subject_id').references(() => subjects.id),
  staffId: text('staff_id').references(() => staff.id),
  type: text('type').notNull(), // DeliverableType
  title: text('title').notNull(),
  status: text('status').notNull(), // DeliverableStatus
  dueDate: text('due_date'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

/**
 * Tasks - the atomic unit of work.
 * task_type = Research: a research assignment against a subject.
 * task_type = Document: a writing assignment that IS a document in a deliverable.
 * All documents are tasks; not all tasks are documents.
 */
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  subjectId: text('subject_id')
    .notNull()
    .references(() => subjects.id),
  staffId: text('staff_id').references(() => staff.id),
  taskType: text('task_type').notNull(), // TaskType
  deliverableId: text('deliverable_id').references(() => deliverables.id),
  parentDocumentId: text('parent_document_id'), // self-referential FK to tasks.id
  sortOrder: integer('sort_order'),
  title: text('title').notNull(),
  category: text('category').notNull(), // TaskCategory
  status: text('status').notNull(), // TaskStatus
  priority: text('priority').notNull(), // TaskPriority
  dueDate: text('due_date'),
  notes: text('notes'),
  closedAt: text('closed_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export type Client = typeof clients.$inferSelect
export type NewClient = typeof clients.$inferInsert

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert

export type ProjectGroup = typeof projectGroups.$inferSelect
export type NewProjectGroup = typeof projectGroups.$inferInsert

export type Subject = typeof subjects.$inferSelect
export type NewSubject = typeof subjects.$inferInsert

export type Staff = typeof staff.$inferSelect
export type NewStaff = typeof staff.$inferInsert

export type Deliverable = typeof deliverables.$inferSelect
export type NewDeliverable = typeof deliverables.$inferInsert

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
