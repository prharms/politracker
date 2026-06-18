/**
 * Composition root - the only file permitted to import from all layers.
 * Wires infrastructure repositories to application use cases.
 */
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { ListStaffUseCase } from './application/use-cases/staff/list-staff-use-case'
import { ListProjectsUseCase } from './application/use-cases/projects/list-projects-use-case'
import { ListDeliverablesUseCase } from './application/use-cases/deliverables/list-deliverables-use-case'
import { ListTasksUseCase } from './application/use-cases/tasks/list-tasks-use-case'
/** Build a ListStaffUseCase wired to the Drizzle repository. */
export declare function makeListStaffUseCase(db: BetterSQLite3Database): ListStaffUseCase
/** Build a ListProjectsUseCase wired to the Drizzle repository. */
export declare function makeListProjectsUseCase(db: BetterSQLite3Database): ListProjectsUseCase
/** Build a ListDeliverablesUseCase wired to the Drizzle repository. */
export declare function makeListDeliverablesUseCase(
  db: BetterSQLite3Database
): ListDeliverablesUseCase
/** Build a ListTasksUseCase wired to the Drizzle repository. */
export declare function makeListTasksUseCase(db: BetterSQLite3Database): ListTasksUseCase
