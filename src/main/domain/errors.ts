/**
 * Typed domain errors for all entities.
 * Repositories must throw these instead of raw Error instances so that
 * callers can distinguish domain violations from unexpected failures.
 */

/** Thrown when a project with the given id does not exist. */
export class ProjectNotFoundError extends Error {
  /** Construct with the missing project id. */
  constructor(id: string) {
    super(`Project not found: ${id}`)
    this.name = 'ProjectNotFoundError'
  }
}

/** Thrown when a task with the given id does not exist. */
export class TaskNotFoundError extends Error {
  /** Construct with the missing task id. */
  constructor(id: string) {
    super(`Task not found: ${id}`)
    this.name = 'TaskNotFoundError'
  }
}

/** Thrown when a staff member with the given id does not exist. */
export class StaffNotFoundError extends Error {
  /** Construct with the missing staff id. */
  constructor(id: string) {
    super(`Staff member not found: ${id}`)
    this.name = 'StaffNotFoundError'
  }
}

/** Thrown when a subproject with the given id does not exist. */
export class SubprojectNotFoundError extends Error {
  /** Construct with the missing subproject id. */
  constructor(id: string) {
    super(`Subproject not found: ${id}`)
    this.name = 'SubprojectNotFoundError'
  }
}

/** Thrown when a deliverable with the given id does not exist. */
export class DeliverableNotFoundError extends Error {
  /** Construct with the missing deliverable id. */
  constructor(id: string) {
    super(`Deliverable not found: ${id}`)
    this.name = 'DeliverableNotFoundError'
  }
}

/** Thrown when a staff member cannot be deleted because they have assigned tasks. */
export class StaffHasTasksError extends Error {
  /** Construct with the staff id and the number of blocking tasks. */
  constructor(staffId: string, taskCount: number) {
    super(`Staff ${staffId} has ${taskCount} assigned task(s) and cannot be deleted`)
    this.name = 'StaffHasTasksError'
  }
}
