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
  SubjectDto,
  NewSubjectInput,
  UpdateSubjectInput,
  DeleteSubjectResult
} from './dtos/subject-dto'
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

/** Typed API for subject IPC channels. */
export interface SubjectsAPI {
  list: (projectId?: string) => Promise<SubjectDto[]>
  create: (input: NewSubjectInput) => Promise<SubjectDto>
  update: (id: string, input: UpdateSubjectInput) => Promise<SubjectDto>
  delete: (id: string) => Promise<DeleteSubjectResult>
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
  subjects: SubjectsAPI
  staff: StaffAPI
  projects: ProjectsAPI
  tasks: TasksAPI
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
