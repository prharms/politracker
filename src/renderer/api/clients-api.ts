import type {
  ClientDto,
  NewClientInput,
  UpdateClientInput,
  DeleteClientResult
} from '../../shared/dtos/client-dto'

/** Fetch all clients. */
export function apiListClients(): Promise<ClientDto[]> {
  return window.api.clients.list()
}

/** Create a new client. */
export function apiCreateClient(input: NewClientInput): Promise<ClientDto> {
  return window.api.clients.create(input)
}

/** Update a client's name. */
export function apiUpdateClient(id: string, input: UpdateClientInput): Promise<ClientDto> {
  return window.api.clients.update(id, input)
}

/** Delete a client. */
export function apiDeleteClient(id: string): Promise<DeleteClientResult> {
  return window.api.clients.delete(id)
}
