import type { ClientRepositoryPort } from '../../ports/client-repository-port'
import type { ClientDto, UpdateClientInput } from '../../../../shared/dtos/client-dto'

/** Update a client's name. */
export class UpdateClientUseCase {
  /** Construct with a client repository port. */
  constructor(private readonly repo: ClientRepositoryPort) {}

  /** Validate input, apply update, and return the updated record. */
  execute(id: string, input: UpdateClientInput): ClientDto {
    if (!id.trim()) throw new Error('Client id must not be empty')
    if (!input.name.trim()) throw new Error('Client name must not be empty')
    return this.repo.update(id, input)
  }
}
