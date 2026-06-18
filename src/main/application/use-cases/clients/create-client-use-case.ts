import type { ClientRepositoryPort } from '../../ports/client-repository-port'
import type { ClientDto, NewClientInput } from '../../../../shared/dtos/client-dto'

/** Create a new client. */
export class CreateClientUseCase {
  /** Construct with a client repository port. */
  constructor(private readonly repo: ClientRepositoryPort) {}

  /** Validate input, persist a new client, and return it. */
  execute(input: NewClientInput): ClientDto {
    if (!input.name.trim()) throw new Error('Client name must not be empty')
    return this.repo.create(input)
  }
}
