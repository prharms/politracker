import { contextBridge, ipcRenderer } from 'electron'
import type { TaskListFilters } from '../shared/dtos/task-dto'

/** Expose typed API to renderer process via context bridge. */
contextBridge.exposeInMainWorld('api', {
  tasks: {
    list: (filters?: TaskListFilters) => ipcRenderer.invoke('tasks:list', filters ?? {})
  },
  staff: {
    list: () => ipcRenderer.invoke('staff:list')
  },
  projects: {
    list: () => ipcRenderer.invoke('projects:list')
  }
})
