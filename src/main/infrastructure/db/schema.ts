import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

/** Projects - the top-level engagement. Client information is kept off-system. */
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // ProjectType
  status: text('status').notNull(), // ProjectStatus
  dueDate: text('due_date').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

/**
 * Subprojects - optional intermediate level within a project.
 * Used for contests (Candidate Campaigns), bills/issues (Legislative Advocacy),
 * or any finer-grained grouping within a project.
 * The auto-created default subproject is named "None" and has a null due_date,
 * which inherits the parent project's due date at display time.
 */
export const subprojects = sqliteTable('subprojects', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id),
  name: text('name').notNull(),
  status: text('status').notNull().default('Active'), // SubprojectStatus
  dueDate: text('due_date'), // null for default "None" subproject - inherits from parent project
  createdAt: text('created_at').notNull()
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
 * Scoped to the whole project or an optional subproject.
 * Supports nesting via parent_deliverable_id.
 */
export const deliverables = sqliteTable('deliverables', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id),
  parentDeliverableId: text('parent_deliverable_id'),
  subprojectId: text('subproject_id').references(() => subprojects.id),
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
 * Tasks - the atomic unit of work assigned to a project.
 * Must be scoped to a subproject (every project has a default "None" subproject).
 * Optionally assigned to a staff member.
 * Due date is required on all tasks.
 */
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id),
  subprojectId: text('subproject_id')
    .notNull()
    .references(() => subprojects.id),
  staffId: text('staff_id').references(() => staff.id),
  title: text('title').notNull(),
  scope: text('scope').notNull(), // TaskScope
  status: text('status').notNull(), // TaskStatus
  priority: text('priority').notNull(), // TaskPriority
  dueDate: text('due_date').notNull(),
  notes: text('notes'),
  closedAt: text('closed_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert

export type Subproject = typeof subprojects.$inferSelect
export type NewSubproject = typeof subprojects.$inferInsert

export type Staff = typeof staff.$inferSelect
export type NewStaff = typeof staff.$inferInsert

export type Deliverable = typeof deliverables.$inferSelect
export type NewDeliverable = typeof deliverables.$inferInsert

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
