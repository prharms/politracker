/** Derive initials from a full name. "Paul Harms" -> "PH", "John" -> "J". */
export function deriveInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map(word => word[0]?.toUpperCase() ?? '')
    .join('')
}
