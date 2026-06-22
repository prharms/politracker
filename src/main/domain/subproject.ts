import type { SubprojectStatus } from '../../shared/constants'

/**
 * Core subproject domain entity.
 * Carries only the subproject's own persistent properties.
 */
export interface Subproject {
  readonly id: string
  readonly projectId: string
  readonly name: string
  readonly status: SubprojectStatus
  /** Null when the subproject inherits its due date from the parent project. */
  readonly dueDate: string | null
  readonly createdAt: string
}

/** Default status applied to a newly created subproject. */
export const DEFAULT_SUBPROJECT_STATUS: SubprojectStatus = 'Active'

/**
 * Resolve the effective due date for a subproject.
 *
 * Rule: if the subproject has its own dueDate, return it. Otherwise the
 * subproject inherits the due date from its parent project. The "None"
 * subproject always uses this fallback because its dueDate is stored as null.
 */
export function resolveSubprojectDueDate(
  subprojectDueDate: string | null,
  projectDueDate: string
): string {
  return subprojectDueDate ?? projectDueDate
}
