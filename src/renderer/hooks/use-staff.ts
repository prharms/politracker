import { useState, useEffect, useCallback } from 'react'
import type {
  StaffDto,
  NewStaffInput,
  UpdateStaffInput,
  DeleteStaffResult
} from '../../shared/dtos/staff-dto'
import {
  apiListStaff,
  apiCreateStaff,
  apiUpdateStaff,
  apiUpdateStaffStatus,
  apiDeleteStaff
} from '../api/staff-api'

/** Returns 0 for Active staff and 1 for Inactive so active members sort first. */
function statusTier(s: StaffDto): number {
  return s.status === 'Active' ? 0 : 1
}

/** Sorts staff active-first then alphabetically by name within each tier. */
function sortStaff(list: StaffDto[]): StaffDto[] {
  return [...list].sort((a, b) => {
    const tierDiff = statusTier(a) - statusTier(b)
    return tierDiff !== 0 ? tierDiff : a.name.localeCompare(b.name)
  })
}

/** Provides the full staff list with create, update, toggle, and delete helpers. */
export function useStaff() {
  const [staff, setStaff] = useState<StaffDto[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const data = await apiListStaff()
    setStaff(sortStaff(data))
    setLoading(false)
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const createStaff = useCallback(async (input: NewStaffInput): Promise<StaffDto> => {
    const created = await apiCreateStaff(input)
    setStaff(prev => sortStaff([...prev, created]))
    return created
  }, [])

  const updateStaff = useCallback(
    async (id: string, input: UpdateStaffInput): Promise<StaffDto> => {
      const updated = await apiUpdateStaff(id, input)
      setStaff(prev => sortStaff(prev.map(s => (s.id === id ? updated : s))))
      return updated
    },
    []
  )

  const toggleStatus = useCallback(
    async (id: string, current: 'Active' | 'Inactive'): Promise<StaffDto> => {
      const next = current === 'Active' ? 'Inactive' : 'Active'
      const updated = await apiUpdateStaffStatus(id, next)
      setStaff(prev => sortStaff(prev.map(s => (s.id === id ? updated : s))))
      return updated
    },
    []
  )

  const deleteStaff = useCallback(async (id: string): Promise<DeleteStaffResult> => {
    const result = await apiDeleteStaff(id)
    if (result.deleted) {
      setStaff(prev => prev.filter(s => s.id !== id))
    }
    return result
  }, [])

  return { staff, loading, reload, createStaff, updateStaff, toggleStatus, deleteStaff }
}
