import { useState, useEffect, useCallback } from 'react'
import { apiListTasks, apiCreateTask, apiUpdateTask, apiDeleteTask } from '../api/tasks-api'
import type {
  TaskDto,
  TaskListFilters,
  NewTaskInput,
  UpdateTaskInput,
  DeleteTaskResult
} from '../../shared/dtos/task-dto'

/** Fetch and manage task list state with full CRUD. */
export function useTasks(filters: TaskListFilters): {
  tasks: TaskDto[]
  loading: boolean
  refresh: () => void
  createTask: (input: NewTaskInput) => Promise<TaskDto>
  updateTask: (id: string, input: UpdateTaskInput) => Promise<TaskDto>
  deleteTask: (id: string) => Promise<DeleteTaskResult>
} {
  const [tasks, setTasks] = useState<TaskDto[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    apiListTasks(filters).then(data => {
      setTasks(data)
      setLoading(false)
    })
  }, [filters.staffId, filters.projectId, filters.status])

  useEffect(() => {
    load()
  }, [load])

  const createTask = useCallback(async (input: NewTaskInput): Promise<TaskDto> => {
    const created = await apiCreateTask(input)
    setTasks(prev => [created, ...prev])
    return created
  }, [])

  const updateTask = useCallback(async (id: string, input: UpdateTaskInput): Promise<TaskDto> => {
    const updated = await apiUpdateTask(id, input)
    setTasks(prev => prev.map(t => (t.id === id ? updated : t)))
    return updated
  }, [])

  const deleteTask = useCallback(async (id: string): Promise<DeleteTaskResult> => {
    const result = await apiDeleteTask(id)
    if (result.deleted) setTasks(prev => prev.filter(t => t.id !== id))
    return result
  }, [])

  return { tasks, loading, refresh: load, createTask, updateTask, deleteTask }
}
