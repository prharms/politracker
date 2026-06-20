/** Presentation-safe view of a client. */
export interface ClientDto {
  id: string
  name: string
  createdAt: string
}

/** Fields required to create a new client. */
export interface NewClientInput {
  name: string
}

/** Fields that can be updated on a client. */
export interface UpdateClientInput {
  name: string
}

/** Result returned by a delete client operation. */
export interface DeleteClientResult {
  deleted: boolean
  projectCount: number
}
