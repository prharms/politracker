import { useState, useEffect, useCallback } from 'react'
import { staffApi } from '../api/staff-api'
import type { StaffDto, NewStaffInput } from '../../shared/dtos/staff-dto'

/** State and actions for managing the staff list. */
export interface UseStaffResult {
  staff: StaffDto[]
  loading: boolean
  createStaff: (input: NewStaffInput) => Promise<void>
  toggleStatus: (id: string, current: 'Active' | 'Inactive') => Promise<void>
}

/** Fetch the staff list and expose create/update actions. */
export function useStaff(): UseStaffResult {
  const [staff, setStaff] = useState<StaffDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    staffApi.list().then(data => {
      setStaff(data)
      setLoading(false)
    })
  }, [])

  const createStaff = useCallback(async (input: NewStaffInput): Promise<void> => {
    const created = await staffApi.create(input)
    setStaff(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
  }, [])

  const toggleStatus = useCallback(
    async (id: string, current: 'Active' | 'Inactive'): Promise<void> => {
      const next = current === 'Active' ? 'Inactive' : 'Active'
      const updated = await staffApi.updateStatus(id, next)
      setStaff(prev => prev.map(s => (s.id === updated.id ? updated : s)))
    },
    []
  )

  return { staff, loading, createStaff, toggleStatus }
}
