import type { StaffStatus } from '../../shared/constants'
import { deriveInitials } from '../../shared/utils/derive-initials'

/**
 * Core staff domain entity.
 * Carries only the staff member's own persistent properties.
 */
export interface Staff {
  readonly id: string
  readonly name: string
  readonly initials: string
  readonly status: StaffStatus
  readonly createdAt: string
}

/**
 * Validate that a staff name is non-empty.
 * @throws {Error} if the name is blank after trimming
 */
export function validateStaffName(name: string): void {
  if (!name.trim()) throw new Error('Staff name must not be empty')
}

/**
 * Resolve the initials to store for a staff member.
 *
 * Rule: if initials are explicitly provided, use them as-is. Otherwise
 * derive initials from the name using the shared deriveInitials utility.
 * This rule applies on both create and update - if a name changes and
 * no explicit initials are provided, initials are re-derived.
 */
export function resolveStaffInitials(name: string, provided?: string | null): string {
  if (provided) return provided
  return deriveInitials(name)
}
