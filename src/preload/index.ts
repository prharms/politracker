import { contextBridge, ipcRenderer } from 'electron'
import type { TaskListFilters } from '../shared/dtos/task-dto'
import type { NewStaffInput } from '../shared/dtos/staff-dto'

/** Expose typed API to renderer process via context bridge. */
contextBridge.exposeInMainWorld('api', {
  tasks: {
    list: (filters?: TaskListFilters) => ipcRenderer.invoke('tasks:list', filters ?? {})
  },
  staff: {
    list: () => ipcRenderer.invoke('staff:list'),
    create: (input: NewStaffInput) => ipcRenderer.invoke('staff:create', input),
    updateStatus: (id: string, status: 'Active' | 'Inactive') =>
      ipcRenderer.invoke('staff:updateStatus', id, status)
  },
  projects: {
    list: () => ipcRenderer.invoke('projects:list')
  }
})
