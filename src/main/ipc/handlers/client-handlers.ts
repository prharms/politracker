import { ipcMain } from 'electron'
import type { ListClientsUseCase } from '../../application/use-cases/clients/list-clients-use-case'
import type { CreateClientUseCase } from '../../application/use-cases/clients/create-client-use-case'
import type { UpdateClientUseCase } from '../../application/use-cases/clients/update-client-use-case'
import type { DeleteClientUseCase } from '../../application/use-cases/clients/delete-client-use-case'
import type { NewClientInput, UpdateClientInput } from '../../../shared/dtos/client-dto'

/** Register all client IPC handlers. */
export function registerClientHandlers(
  listClients: ListClientsUseCase,
  createClient: CreateClientUseCase,
  updateClient: UpdateClientUseCase,
  deleteClient: DeleteClientUseCase
): void {
  ipcMain.handle('clients:list', () => listClients.execute())
  ipcMain.handle('clients:create', (_e, input: NewClientInput) => createClient.execute(input))
  ipcMain.handle('clients:update', (_e, id: string, input: UpdateClientInput) =>
    updateClient.execute(id, input)
  )
  ipcMain.handle('clients:delete', (_e, id: string) => deleteClient.execute(id))
}
