import { contextBridge, ipcRenderer } from 'electron'
import type { TaskListFilters, NewTaskInput, UpdateTaskInput } from '../shared/dtos/task-dto'
import type { NewStaffInput, UpdateStaffInput } from '../shared/dtos/staff-dto'
import type { NewClientInput, UpdateClientInput } from '../shared/dtos/client-dto'
import type { NewSubjectInput, UpdateSubjectInput } from '../shared/dtos/subject-dto'
import type { NewProjectInput, UpdateProjectInput } from '../shared/dtos/project-dto'

/** Expose typed API to renderer process via context bridge. */
contextBridge.exposeInMainWorld('api', {
  clients: {
    list: () => ipcRenderer.invoke('clients:list'),
    create: (input: NewClientInput) => ipcRenderer.invoke('clients:create', input),
    update: (id: string, input: UpdateClientInput) =>
      ipcRenderer.invoke('clients:update', id, input),
    delete: (id: string) => ipcRenderer.invoke('clients:delete', id)
  },
  subjects: {
    list: (projectId?: string) => ipcRenderer.invoke('subjects:list', projectId),
    create: (input: NewSubjectInput) => ipcRenderer.invoke('subjects:create', input),
    update: (id: string, input: UpdateSubjectInput) =>
      ipcRenderer.invoke('subjects:update', id, input),
    delete: (id: string) => ipcRenderer.invoke('subjects:delete', id)
  },
  staff: {
    list: () => ipcRenderer.invoke('staff:list'),
    create: (input: NewStaffInput) => ipcRenderer.invoke('staff:create', input),
    update: (id: string, input: UpdateStaffInput) => ipcRenderer.invoke('staff:update', id, input),
    updateStatus: (id: string, status: 'Active' | 'Inactive') =>
      ipcRenderer.invoke('staff:updateStatus', id, status),
    delete: (id: string) => ipcRenderer.invoke('staff:delete', id)
  },
  projects: {
    list: () => ipcRenderer.invoke('projects:list'),
    create: (input: NewProjectInput) => ipcRenderer.invoke('projects:create', input),
    update: (id: string, input: UpdateProjectInput) =>
      ipcRenderer.invoke('projects:update', id, input),
    delete: (id: string) => ipcRenderer.invoke('projects:delete', id)
  },
  tasks: {
    list: (filters?: TaskListFilters) => ipcRenderer.invoke('tasks:list', filters ?? {}),
    create: (input: NewTaskInput) => ipcRenderer.invoke('tasks:create', input),
    update: (id: string, input: UpdateTaskInput) => ipcRenderer.invoke('tasks:update', id, input),
    delete: (id: string) => ipcRenderer.invoke('tasks:delete', id)
  }
})
