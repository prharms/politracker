import { contextBridge } from 'electron'

/** Expose typed API to renderer process via context bridge. */
contextBridge.exposeInMainWorld('api', {
  // IPC channel groups will be added here as features are implemented
})
