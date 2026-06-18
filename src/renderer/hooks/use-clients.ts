import { useState, useEffect, useCallback } from 'react'
import {
  apiListClients,
  apiCreateClient,
  apiUpdateClient,
  apiDeleteClient
} from '../api/clients-api'
import type {
  ClientDto,
  NewClientInput,
  UpdateClientInput,
  DeleteClientResult
} from '../../shared/dtos/client-dto'

/** Fetch and manage client list state with full CRUD. */
export function useClients() {
  const [clients, setClients] = useState<ClientDto[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const data = await apiListClients()
    setClients(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const createClient = useCallback(async (input: NewClientInput): Promise<ClientDto> => {
    const created = await apiCreateClient(input)
    setClients(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
    return created
  }, [])

  const updateClient = useCallback(
    async (id: string, input: UpdateClientInput): Promise<ClientDto> => {
      const updated = await apiUpdateClient(id, input)
      setClients(prev =>
        prev.map(c => (c.id === id ? updated : c)).sort((a, b) => a.name.localeCompare(b.name))
      )
      return updated
    },
    []
  )

  const deleteClient = useCallback(async (id: string): Promise<DeleteClientResult> => {
    const result = await apiDeleteClient(id)
    if (result.deleted) setClients(prev => prev.filter(c => c.id !== id))
    return result
  }, [])

  return { clients, loading, reload, createClient, updateClient, deleteClient }
}
