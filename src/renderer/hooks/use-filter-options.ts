import { useState, useEffect } from 'react'
import { staffApi } from '../api/staff-api'
import { projectsApi } from '../api/projects-api'
import type { StaffDto } from '../../shared/dtos/staff-dto'
import type { ProjectDto } from '../../shared/dtos/project-dto'

/** Fetch staff and project lists for filter dropdowns. */
export function useFilterOptions(): {
  staff: StaffDto[]
  projects: ProjectDto[]
  loading: boolean
} {
  const [staff, setStaff] = useState<StaffDto[]>([])
  const [projects, setProjects] = useState<ProjectDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([staffApi.list(), projectsApi.list()]).then(([s, p]) => {
      setStaff(s)
      setProjects(p)
      setLoading(false)
    })
  }, [])

  return { staff, projects, loading }
}
