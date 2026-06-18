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

/** Provides the full staff list with create, update, toggle, and delete helpers. */
export function useStaff() {
  const [staff, setStaff] = useState<StaffDto[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const data = await apiListStaff()
    setStaff(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const createStaff = useCallback(async (input: NewStaffInput): Promise<StaffDto> => {
    const created = await apiCreateStaff(input)
    setStaff(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
    return created
  }, [])

  const updateStaff = useCallback(
    async (id: string, input: UpdateStaffInput): Promise<StaffDto> => {
      const updated = await apiUpdateStaff(id, input)
      setStaff(prev =>
        prev.map(s => (s.id === id ? updated : s)).sort((a, b) => a.name.localeCompare(b.name))
      )
      return updated
    },
    []
  )

  const toggleStatus = useCallback(
    async (id: string, current: 'Active' | 'Inactive'): Promise<StaffDto> => {
      const next = current === 'Active' ? 'Inactive' : 'Active'
      const updated = await apiUpdateStaffStatus(id, next)
      setStaff(prev => prev.map(s => (s.id === id ? updated : s)))
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
