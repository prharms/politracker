import type { ClientRepositoryPort } from '../../ports/client-repository-port'
import type { ClientDto } from '../../../../shared/dtos/client-dto'

/** Return all clients ordered by name. */
export class ListClientsUseCase {
  /** Construct with a client repository port. */
  constructor(private readonly repo: ClientRepositoryPort) {}

  /** Delegate to the repository and return all records. */
  execute(): ClientDto[] {
    return this.repo.listAll()
  }
}
