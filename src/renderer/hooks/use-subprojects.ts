import { useState, useEffect, useCallback } from 'react'
import {
  apiListSubprojects,
  apiCreateSubproject,
  apiUpdateSubproject,
  apiDeleteSubproject
} from '../api/subprojects-api'
import type {
  SubprojectDto,
  NewSubprojectInput,
  UpdateSubprojectInput,
  DeleteSubprojectResult
} from '../../shared/dtos/subproject-dto'

/** Fetch and manage subprojects for a given project, with full CRUD. */
export function useSubprojects(projectId: string | null): {
  subprojects: SubprojectDto[]
  loading: boolean
  createSubproject: (input: NewSubprojectInput) => Promise<SubprojectDto>
  updateSubproject: (id: string, input: UpdateSubprojectInput) => Promise<SubprojectDto>
  deleteSubproject: (id: string) => Promise<DeleteSubprojectResult>
} {
  const [subprojects, setSubprojects] = useState<SubprojectDto[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(() => {
    if (!projectId) {
      setSubprojects([])
      return
    }
    setLoading(true)
    apiListSubprojects(projectId)
      .then(data => {
        setSubprojects(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [projectId])

  useEffect(() => {
    load()
  }, [load])

  const createSubproject = useCallback(
    async (input: NewSubprojectInput): Promise<SubprojectDto> => {
      const created = await apiCreateSubproject(input)
      setSubprojects(prev => [...prev, created])
      return created
    },
    []
  )

  const updateSubproject = useCallback(
    async (id: string, input: UpdateSubprojectInput): Promise<SubprojectDto> => {
      const updated = await apiUpdateSubproject(id, input)
      setSubprojects(prev => prev.map(s => (s.id === id ? updated : s)))
      return updated
    },
    []
  )

  const deleteSubproject = useCallback(async (id: string): Promise<DeleteSubprojectResult> => {
    const result = await apiDeleteSubproject(id)
    if (result.deleted) setSubprojects(prev => prev.filter(s => s.id !== id))
    return result
  }, [])

  return { subprojects, loading, createSubproject, updateSubproject, deleteSubproject }
}
