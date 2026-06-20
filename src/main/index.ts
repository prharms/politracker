import { app, BrowserWindow, Menu } from 'electron'
import path from 'path'
import { openDatabase } from './infrastructure/db/database'
import {
  makeListClientsUseCase,
  makeCreateClientUseCase,
  makeUpdateClientUseCase,
  makeDeleteClientUseCase,
  makeListSubprojectsUseCase,
  makeCreateSubprojectUseCase,
  makeUpdateSubprojectUseCase,
  makeDeleteSubprojectUseCase,
  makeListStaffUseCase,
  makeCreateStaffUseCase,
  makeUpdateStaffUseCase,
  makeUpdateStaffStatusUseCase,
  makeDeleteStaffUseCase,
  makeListProjectsUseCase,
  makeCreateProjectUseCase,
  makeUpdateProjectUseCase,
  makeDeleteProjectUseCase,
  makeListTasksUseCase,
  makeCreateTaskUseCase,
  makeUpdateTaskUseCase,
  makeDeleteTaskUseCase
} from './container'
import { registerAllHandlers } from './ipc/index'

// Store the database in Local AppData, not Roaming.
// Roaming is synced across machines on domain networks, which can corrupt a live SQLite file.
if (process.env['LOCALAPPDATA']) {
  app.setPath('userData', path.join(process.env['LOCALAPPDATA'], 'Politicket'))
}

/** Create the main application window. */
function createWindow(): void {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: '#000000',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#000000',
      symbolColor: '#e8e8e8',
      height: 32
    },
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  if (process.env['NODE_ENV'] === 'development') {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'] ?? 'http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  const db = openDatabase()
  registerAllHandlers(
    makeListClientsUseCase(db),
    makeCreateClientUseCase(db),
    makeUpdateClientUseCase(db),
    makeDeleteClientUseCase(db),
    makeListSubprojectsUseCase(db),
    makeCreateSubprojectUseCase(db),
    makeUpdateSubprojectUseCase(db),
    makeDeleteSubprojectUseCase(db),
    makeListStaffUseCase(db),
    makeCreateStaffUseCase(db),
    makeUpdateStaffUseCase(db),
    makeUpdateStaffStatusUseCase(db),
    makeDeleteStaffUseCase(db),
    makeListProjectsUseCase(db),
    makeCreateProjectUseCase(db),
    makeUpdateProjectUseCase(db),
    makeDeleteProjectUseCase(db),
    makeListTasksUseCase(db),
    makeCreateTaskUseCase(db),
    makeUpdateTaskUseCase(db),
    makeDeleteTaskUseCase(db)
  )
  Menu.setApplicationMenu(null)
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
