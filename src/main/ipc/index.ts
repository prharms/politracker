import { registerClientHandlers } from './handlers/client-handlers'
import { registerSubjectHandlers } from './handlers/subject-handlers'
import { registerStaffHandlers } from './handlers/staff-handlers'
import { registerProjectHandlers } from './handlers/project-handlers'
import { registerTaskHandlers } from './handlers/task-handlers'

import type { ListClientsUseCase } from '../application/use-cases/clients/list-clients-use-case'
import type { CreateClientUseCase } from '../application/use-cases/clients/create-client-use-case'
import type { UpdateClientUseCase } from '../application/use-cases/clients/update-client-use-case'
import type { DeleteClientUseCase } from '../application/use-cases/clients/delete-client-use-case'

import type { ListSubjectsUseCase } from '../application/use-cases/subjects/list-subjects-use-case'
import type { CreateSubjectUseCase } from '../application/use-cases/subjects/create-subject-use-case'
import type { UpdateSubjectUseCase } from '../application/use-cases/subjects/update-subject-use-case'
import type { DeleteSubjectUseCase } from '../application/use-cases/subjects/delete-subject-use-case'

import type { ListStaffUseCase } from '../application/use-cases/staff/list-staff-use-case'
import type { CreateStaffUseCase } from '../application/use-cases/staff/create-staff-use-case'
import type { UpdateStaffUseCase } from '../application/use-cases/staff/update-staff-use-case'
import type { UpdateStaffStatusUseCase } from '../application/use-cases/staff/update-staff-status-use-case'
import type { DeleteStaffUseCase } from '../application/use-cases/staff/delete-staff-use-case'

import type { ListProjectsUseCase } from '../application/use-cases/projects/list-projects-use-case'
import type { CreateProjectUseCase } from '../application/use-cases/projects/create-project-use-case'
import type { UpdateProjectUseCase } from '../application/use-cases/projects/update-project-use-case'
import type { DeleteProjectUseCase } from '../application/use-cases/projects/delete-project-use-case'

import type { ListTasksUseCase } from '../application/use-cases/tasks/list-tasks-use-case'
import type { CreateTaskUseCase } from '../application/use-cases/tasks/create-task-use-case'
import type { UpdateTaskUseCase } from '../application/use-cases/tasks/update-task-use-case'
import type { DeleteTaskUseCase } from '../application/use-cases/tasks/delete-task-use-case'

/** Register all IPC handlers. Called once from src/main/index.ts at startup. */
export function registerAllHandlers(
  listClients: ListClientsUseCase,
  createClient: CreateClientUseCase,
  updateClient: UpdateClientUseCase,
  deleteClient: DeleteClientUseCase,
  listSubjects: ListSubjectsUseCase,
  createSubject: CreateSubjectUseCase,
  updateSubject: UpdateSubjectUseCase,
  deleteSubject: DeleteSubjectUseCase,
  listStaff: ListStaffUseCase,
  createStaff: CreateStaffUseCase,
  updateStaff: UpdateStaffUseCase,
  updateStaffStatus: UpdateStaffStatusUseCase,
  deleteStaff: DeleteStaffUseCase,
  listProjects: ListProjectsUseCase,
  createProject: CreateProjectUseCase,
  updateProject: UpdateProjectUseCase,
  deleteProject: DeleteProjectUseCase,
  listTasks: ListTasksUseCase,
  createTask: CreateTaskUseCase,
  updateTask: UpdateTaskUseCase,
  deleteTask: DeleteTaskUseCase
): void {
  registerClientHandlers(listClients, createClient, updateClient, deleteClient)
  registerSubjectHandlers(listSubjects, createSubject, updateSubject, deleteSubject)
  registerStaffHandlers(listStaff, createStaff, updateStaff, updateStaffStatus, deleteStaff)
  registerProjectHandlers(listProjects, createProject, updateProject, deleteProject)
  registerTaskHandlers(listTasks, createTask, updateTask, deleteTask)
}
