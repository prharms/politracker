import { useState, useEffect, useCallback } from 'react'
import { tasksApi } from '../api/tasks-api'
import type { TaskDto, TaskListFilters } from '../../shared/dtos/task-dto'

/** Fetch and manage task list state with optional filters. */
export function useTasks(filters: TaskListFilters): {
  tasks: TaskDto[]
  loading: boolean
  refresh: () => void
} {
  const [tasks, setTasks] = useState<TaskDto[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    tasksApi.list(filters).then(data => {
      setTasks(data)
      setLoading(false)
    })
  }, [filters.staffId, filters.projectId, filters.deliverableId, filters.status])

  useEffect(() => {
    load()
  }, [load])

  return { tasks, loading, refresh: load }
}
