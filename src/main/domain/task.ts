import type { TaskStatus, TaskScope, TaskPriority } from '../../shared/constants'

/**
 * Core task domain entity.
 * Carries only the task's own persistent properties - no joined display data.
 * Use TaskDto when joined fields (projectName, staffName) are needed.
 */
export interface Task {
  readonly id: string
  readonly title: string
  readonly scope: TaskScope
  readonly status: TaskStatus
  readonly priority: TaskPriority
  readonly projectId: string
  readonly subprojectId: string
  readonly staffId: string | null
  readonly dueDate: string
  readonly notes: string | null
  /** Set when status transitions to Complete; null otherwise. */
  readonly closedAt: string | null
  readonly createdAt: string
  readonly updatedAt: string
}

/**
 * Compute the closedAt value to store when a task's status changes.
 *
 * Rule: closedAt is stamped with the current time when transitioning to
 * Complete. For all other transitions the existing closedAt is preserved
 * (so that reopening a task does not erase its completion timestamp).
 */
export function resolveClosedAt(
  newStatus: TaskStatus,
  currentClosedAt: string | null,
  now: string
): string | null {
  return newStatus === 'Complete' ? now : currentClosedAt
}

/**
 * Validate that a task title is non-empty.
 * @throws {Error} if the title is blank after trimming
 */
export function validateTaskTitle(title: string): void {
  if (!title.trim()) throw new Error('Task title must not be empty')
}

/** Return true when the given status represents a completed task. */
export function isCompleteStatus(status: TaskStatus): boolean {
  return status === 'Complete'
}
