import type {
  TaskDto,
  TaskListFilters,
  NewTaskInput,
  UpdateTaskInput,
  DeleteTaskResult
} from './dtos/task-dto'
import type { StaffDto, NewStaffInput, UpdateStaffInput, DeleteStaffResult } from './dtos/staff-dto'
import type {
  ClientDto,
  NewClientInput,
  UpdateClientInput,
  DeleteClientResult
} from './dtos/client-dto'
import type {
  SubprojectDto,
  NewSubprojectInput,
  UpdateSubprojectInput,
  DeleteSubprojectResult
} from './dtos/subproject-dto'
import type {
  ProjectDto,
  NewProjectInput,
  UpdateProjectInput,
  DeleteProjectResult
} from './dtos/project-dto'

/** Typed API for client IPC channels. */
export interface ClientsAPI {
  list: () => Promise<ClientDto[]>
  create: (input: NewClientInput) => Promise<ClientDto>
  update: (id: string, input: UpdateClientInput) => Promise<ClientDto>
  delete: (id: string) => Promise<DeleteClientResult>
}

/** Typed API for subproject IPC channels. */
export interface SubprojectsAPI {
  list: (projectId?: string) => Promise<SubprojectDto[]>
  create: (input: NewSubprojectInput) => Promise<SubprojectDto>
  update: (id: string, input: UpdateSubprojectInput) => Promise<SubprojectDto>
  delete: (id: string) => Promise<DeleteSubprojectResult>
}

/** Typed API for staff IPC channels. */
export interface StaffAPI {
  list: () => Promise<StaffDto[]>
  create: (input: NewStaffInput) => Promise<StaffDto>
  update: (id: string, input: UpdateStaffInput) => Promise<StaffDto>
  updateStatus: (id: string, status: 'Active' | 'Inactive') => Promise<StaffDto>
  delete: (id: string) => Promise<DeleteStaffResult>
}

/** Typed API for project IPC channels. */
export interface ProjectsAPI {
  list: () => Promise<ProjectDto[]>
  create: (input: NewProjectInput) => Promise<ProjectDto>
  update: (id: string, input: UpdateProjectInput) => Promise<ProjectDto>
  delete: (id: string) => Promise<DeleteProjectResult>
}

/** Typed API for task IPC channels. */
export interface TasksAPI {
  list: (filters?: TaskListFilters) => Promise<TaskDto[]>
  create: (input: NewTaskInput) => Promise<TaskDto>
  update: (id: string, input: UpdateTaskInput) => Promise<TaskDto>
  delete: (id: string) => Promise<DeleteTaskResult>
}

/** Typed window.api interface - all IPC channels exposed by preload. */
export interface ElectronAPI {
  clients: ClientsAPI
  subprojects: SubprojectsAPI
  staff: StaffAPI
  projects: ProjectsAPI
  tasks: TasksAPI
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
