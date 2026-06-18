/**
 * Composition root - the only file permitted to import from all layers.
 * Wires infrastructure repositories to application use cases.
 */
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'

import { StaffRepository } from './infrastructure/repositories/staff-repository'
import { ProjectRepository } from './infrastructure/repositories/project-repository'
import { DeliverableRepository } from './infrastructure/repositories/deliverable-repository'
import { TaskRepository } from './infrastructure/repositories/task-repository'

import { ListStaffUseCase } from './application/use-cases/staff/list-staff-use-case'
import { ListProjectsUseCase } from './application/use-cases/projects/list-projects-use-case'
import { ListDeliverablesUseCase } from './application/use-cases/deliverables/list-deliverables-use-case'
import { ListTasksUseCase } from './application/use-cases/tasks/list-tasks-use-case'

/** Build a ListStaffUseCase wired to the Drizzle repository. */
export function makeListStaffUseCase(db: BetterSQLite3Database): ListStaffUseCase {
  return new ListStaffUseCase(new StaffRepository(db))
}

/** Build a ListProjectsUseCase wired to the Drizzle repository. */
export function makeListProjectsUseCase(db: BetterSQLite3Database): ListProjectsUseCase {
  return new ListProjectsUseCase(new ProjectRepository(db))
}

/** Build a ListDeliverablesUseCase wired to the Drizzle repository. */
export function makeListDeliverablesUseCase(db: BetterSQLite3Database): ListDeliverablesUseCase {
  return new ListDeliverablesUseCase(new DeliverableRepository(db))
}

/** Build a ListTasksUseCase wired to the Drizzle repository. */
export function makeListTasksUseCase(db: BetterSQLite3Database): ListTasksUseCase {
  return new ListTasksUseCase(new TaskRepository(db))
}
