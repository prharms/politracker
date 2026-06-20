/**
 * Composition root - the only file permitted to import from all layers.
 * Wires infrastructure repositories to application use cases.
 */
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'

import { ClientRepository } from './infrastructure/repositories/client-repository'
import { SubprojectRepository } from './infrastructure/repositories/subproject-repository'
import { StaffRepository } from './infrastructure/repositories/staff-repository'
import { ProjectRepository } from './infrastructure/repositories/project-repository'
import { DeliverableRepository } from './infrastructure/repositories/deliverable-repository'
import { TaskRepository } from './infrastructure/repositories/task-repository'

import { ListClientsUseCase } from './application/use-cases/clients/list-clients-use-case'
import { CreateClientUseCase } from './application/use-cases/clients/create-client-use-case'
import { UpdateClientUseCase } from './application/use-cases/clients/update-client-use-case'
import { DeleteClientUseCase } from './application/use-cases/clients/delete-client-use-case'

import { ListSubprojectsUseCase } from './application/use-cases/subprojects/list-subprojects-use-case'
import { CreateSubprojectUseCase } from './application/use-cases/subprojects/create-subproject-use-case'
import { UpdateSubprojectUseCase } from './application/use-cases/subprojects/update-subproject-use-case'
import { DeleteSubprojectUseCase } from './application/use-cases/subprojects/delete-subproject-use-case'

import { ListStaffUseCase } from './application/use-cases/staff/list-staff-use-case'
import { CreateStaffUseCase } from './application/use-cases/staff/create-staff-use-case'
import { UpdateStaffUseCase } from './application/use-cases/staff/update-staff-use-case'
import { UpdateStaffStatusUseCase } from './application/use-cases/staff/update-staff-status-use-case'
import { DeleteStaffUseCase } from './application/use-cases/staff/delete-staff-use-case'

import { ListProjectsUseCase } from './application/use-cases/projects/list-projects-use-case'
import { CreateProjectUseCase } from './application/use-cases/projects/create-project-use-case'
import { UpdateProjectUseCase } from './application/use-cases/projects/update-project-use-case'
import { DeleteProjectUseCase } from './application/use-cases/projects/delete-project-use-case'

import { ListDeliverablesUseCase } from './application/use-cases/deliverables/list-deliverables-use-case'

import { ListTasksUseCase } from './application/use-cases/tasks/list-tasks-use-case'
import { CreateTaskUseCase } from './application/use-cases/tasks/create-task-use-case'
import { UpdateTaskUseCase } from './application/use-cases/tasks/update-task-use-case'
import { DeleteTaskUseCase } from './application/use-cases/tasks/delete-task-use-case'

/** Instantiate a ClientRepository for the given database. */
function clients(db: BetterSQLite3Database) {
  return new ClientRepository(db)
}
/** Instantiate a SubprojectRepository for the given database. */
function subprojectsRepo(db: BetterSQLite3Database) {
  return new SubprojectRepository(db)
}
/** Instantiate a StaffRepository for the given database. */
function staffRepo(db: BetterSQLite3Database) {
  return new StaffRepository(db)
}
/** Instantiate a ProjectRepository for the given database. */
function projectsRepo(db: BetterSQLite3Database) {
  return new ProjectRepository(db)
}
/** Instantiate a TaskRepository for the given database. */
function tasksRepo(db: BetterSQLite3Database) {
  return new TaskRepository(db)
}

/** Build a ListClientsUseCase wired to the Drizzle repository. */
export function makeListClientsUseCase(db: BetterSQLite3Database): ListClientsUseCase {
  return new ListClientsUseCase(clients(db))
}
/** Build a CreateClientUseCase wired to the Drizzle repository. */
export function makeCreateClientUseCase(db: BetterSQLite3Database): CreateClientUseCase {
  return new CreateClientUseCase(clients(db))
}
/** Build an UpdateClientUseCase wired to the Drizzle repository. */
export function makeUpdateClientUseCase(db: BetterSQLite3Database): UpdateClientUseCase {
  return new UpdateClientUseCase(clients(db))
}
/** Build a DeleteClientUseCase wired to the Drizzle repository. */
export function makeDeleteClientUseCase(db: BetterSQLite3Database): DeleteClientUseCase {
  return new DeleteClientUseCase(clients(db))
}

/** Build a ListSubprojectsUseCase wired to the Drizzle repository. */
export function makeListSubprojectsUseCase(db: BetterSQLite3Database): ListSubprojectsUseCase {
  return new ListSubprojectsUseCase(subprojectsRepo(db))
}
/** Build a CreateSubprojectUseCase wired to the Drizzle repository. */
export function makeCreateSubprojectUseCase(db: BetterSQLite3Database): CreateSubprojectUseCase {
  return new CreateSubprojectUseCase(subprojectsRepo(db))
}
/** Build an UpdateSubprojectUseCase wired to the Drizzle repository. */
export function makeUpdateSubprojectUseCase(db: BetterSQLite3Database): UpdateSubprojectUseCase {
  return new UpdateSubprojectUseCase(subprojectsRepo(db))
}
/** Build a DeleteSubprojectUseCase wired to the Drizzle repository. */
export function makeDeleteSubprojectUseCase(db: BetterSQLite3Database): DeleteSubprojectUseCase {
  return new DeleteSubprojectUseCase(subprojectsRepo(db))
}

/** Build a ListStaffUseCase wired to the Drizzle repository. */
export function makeListStaffUseCase(db: BetterSQLite3Database): ListStaffUseCase {
  return new ListStaffUseCase(staffRepo(db))
}
/** Build a CreateStaffUseCase wired to the Drizzle repository. */
export function makeCreateStaffUseCase(db: BetterSQLite3Database): CreateStaffUseCase {
  return new CreateStaffUseCase(staffRepo(db))
}
/** Build an UpdateStaffUseCase wired to the Drizzle repository. */
export function makeUpdateStaffUseCase(db: BetterSQLite3Database): UpdateStaffUseCase {
  return new UpdateStaffUseCase(staffRepo(db))
}
/** Build an UpdateStaffStatusUseCase wired to the Drizzle repository. */
export function makeUpdateStaffStatusUseCase(db: BetterSQLite3Database): UpdateStaffStatusUseCase {
  return new UpdateStaffStatusUseCase(staffRepo(db))
}
/** Build a DeleteStaffUseCase wired to the Drizzle repositories. */
export function makeDeleteStaffUseCase(db: BetterSQLite3Database): DeleteStaffUseCase {
  return new DeleteStaffUseCase(staffRepo(db), tasksRepo(db))
}

/** Build a ListProjectsUseCase wired to the Drizzle repository. */
export function makeListProjectsUseCase(db: BetterSQLite3Database): ListProjectsUseCase {
  return new ListProjectsUseCase(projectsRepo(db))
}
/** Build a CreateProjectUseCase wired to the Drizzle repository. */
export function makeCreateProjectUseCase(db: BetterSQLite3Database): CreateProjectUseCase {
  return new CreateProjectUseCase(projectsRepo(db))
}
/** Build an UpdateProjectUseCase wired to the Drizzle repository. */
export function makeUpdateProjectUseCase(db: BetterSQLite3Database): UpdateProjectUseCase {
  return new UpdateProjectUseCase(projectsRepo(db))
}
/** Build a DeleteProjectUseCase wired to the Drizzle repository. */
export function makeDeleteProjectUseCase(db: BetterSQLite3Database): DeleteProjectUseCase {
  return new DeleteProjectUseCase(projectsRepo(db))
}

/** Build a ListDeliverablesUseCase wired to the Drizzle repository. */
export function makeListDeliverablesUseCase(db: BetterSQLite3Database): ListDeliverablesUseCase {
  return new ListDeliverablesUseCase(new DeliverableRepository(db))
}

/** Build a ListTasksUseCase wired to the Drizzle repository. */
export function makeListTasksUseCase(db: BetterSQLite3Database): ListTasksUseCase {
  return new ListTasksUseCase(tasksRepo(db))
}
/** Build a CreateTaskUseCase wired to the Drizzle repository. */
export function makeCreateTaskUseCase(db: BetterSQLite3Database): CreateTaskUseCase {
  return new CreateTaskUseCase(tasksRepo(db))
}
/** Build an UpdateTaskUseCase wired to the Drizzle repository. */
export function makeUpdateTaskUseCase(db: BetterSQLite3Database): UpdateTaskUseCase {
  return new UpdateTaskUseCase(tasksRepo(db))
}
/** Build a DeleteTaskUseCase wired to the Drizzle repository. */
export function makeDeleteTaskUseCase(db: BetterSQLite3Database): DeleteTaskUseCase {
  return new DeleteTaskUseCase(tasksRepo(db))
}
