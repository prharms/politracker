/** Typed response wrapper for all IPC calls. */
export type IpcResponse<T> = { ok: true; data: T } | { ok: false; error: string }

/** Typed window.api interface - all IPC channels exposed by preload. */
export interface ElectronAPI {
  // Channel groups will be added here as features are implemented
  // e.g. clients: ClientsAPI
  // e.g. projects: ProjectsAPI
  // e.g. subjects: SubjectsAPI
  // e.g. staff: StaffAPI
  // e.g. deliverables: DeliverablesAPI
  // e.g. tasks: TasksAPI
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
