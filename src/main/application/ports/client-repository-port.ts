import type { ClientDto, NewClientInput, UpdateClientInput } from '../../../shared/dtos/client-dto'

/** Repository port for client persistence. */
export interface ClientRepositoryPort {
  /** Return all clients ordered by name. */
  listAll(): ClientDto[]

  /** Return a single client by id, or null if not found. */
  findById(id: string): ClientDto | null

  /** Persist a new client and return it. */
  create(input: NewClientInput): ClientDto

  /** Update a client's name and return the updated record. */
  update(id: string, input: UpdateClientInput): ClientDto

  /** Delete a client by id. */
  delete(id: string): void

  /** Return the number of projects linked to this client. */
  countProjects(id: string): number
}
