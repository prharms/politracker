import { useState, useEffect, useCallback } from 'react'
import {
  apiListProjects,
  apiCreateProject,
  apiUpdateProject,
  apiDeleteProject
} from '../api/projects-api'
import type {
  ProjectDto,
  NewProjectInput,
  UpdateProjectInput,
  DeleteProjectResult
} from '../../shared/dtos/project-dto'

/** Fetch and manage project list state with full CRUD. */
export function useProjects() {
  const [projects, setProjects] = useState<ProjectDto[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const data = await apiListProjects()
    setProjects(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const createProject = useCallback(async (input: NewProjectInput): Promise<ProjectDto> => {
    const created = await apiCreateProject(input)
    setProjects(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
    return created
  }, [])

  const updateProject = useCallback(
    async (id: string, input: UpdateProjectInput): Promise<ProjectDto> => {
      const updated = await apiUpdateProject(id, input)
      setProjects(prev =>
        prev.map(p => (p.id === id ? updated : p)).sort((a, b) => a.name.localeCompare(b.name))
      )
      return updated
    },
    []
  )

  const deleteProject = useCallback(async (id: string): Promise<DeleteProjectResult> => {
    const result = await apiDeleteProject(id)
    if (result.deleted) setProjects(prev => prev.filter(p => p.id !== id))
    return result
  }, [])

  return { projects, loading, reload, createProject, updateProject, deleteProject }
}
