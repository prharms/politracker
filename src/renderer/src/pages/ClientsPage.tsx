import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useClients } from '../../hooks/use-clients'
import styles from './CrudPage.module.css'

interface EditingCell {
  id: string
  value: string
}

interface ConfirmDelete {
  id: string
  name: string
}

/** Clients management page. */
export function ClientsPage() {
  const { clients, loading, createClient, updateClient, deleteClient } = useClients()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [showAdd, setShowAdd] = useState(false)
  const [addName, setAddName] = useState('')
  const [editing, setEditing] = useState<EditingCell | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const pageRef = useRef<HTMLDivElement>(null)
  const addInputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    pageRef.current?.focus()
  }, [])

  useEffect(() => {
    if (clients.length > 0) setSelectedIdx(i => Math.min(i, clients.length - 1))
  }, [clients.length])

  useEffect(() => {
    if (showAdd) addInputRef.current?.focus()
  }, [showAdd])
  useEffect(() => {
    if (editing) editInputRef.current?.focus()
  }, [editing])

  const cancelAdd = useCallback(() => {
    setShowAdd(false)
    setAddName('')
    setErrorMsg('')
  }, [])

  const submitAdd = useCallback(async () => {
    if (!addName.trim()) {
      setErrorMsg('Name is required')
      return
    }
    await createClient({ name: addName.trim() })
    setAddName('')
    setShowAdd(false)
    setErrorMsg('')
  }, [addName, createClient])

  const commitEdit = useCallback(async () => {
    if (!editing || !editing.value.trim()) {
      setEditing(null)
      return
    }
    await updateClient(editing.id, { name: editing.value.trim() })
    setEditing(null)
  }, [editing, updateClient])

  const confirmDeleteYes = useCallback(async () => {
    if (!confirmDelete) return
    const result = await deleteClient(confirmDelete.id)
    if (!result.deleted) {
      setErrorMsg(
        `Cannot delete "${confirmDelete.name}" - ${result.projectCount} project${result.projectCount === 1 ? '' : 's'} linked`
      )
    }
    setConfirmDelete(null)
  }, [confirmDelete, deleteClient])

  const handleNavKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIdx(i => Math.max(0, i - 1))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIdx(i => Math.min(i, clients.length - 1))
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        setShowAdd(true)
      } else if ((e.key === 'd' || e.key === 'D') && clients[selectedIdx]) {
        setConfirmDelete({ id: clients[selectedIdx].id, name: clients[selectedIdx].name })
      }
    },
    [clients, selectedIdx]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (editing || confirmDelete) return
      if (showAdd) {
        if (e.key === 'Escape') cancelAdd()
        return
      }
      handleNavKey(e)
    },
    [editing, confirmDelete, showAdd, cancelAdd, handleNavKey]
  )

  return (
    <div ref={pageRef} className={styles.page} onKeyDown={handleKeyDown} tabIndex={0}>
      <div className={styles.header}>
        <span className={styles.title}>CLIENTS</span>
        <span className={styles.hint}>
          {showAdd ? '[ESC] CANCEL' : '[A] ADD  [D] DELETE  [UP/DOWN] SELECT'}
        </span>
      </div>
      {errorMsg && (
        <div className={styles.error} onClick={() => setErrorMsg('')}>
          {errorMsg}
        </div>
      )}
      {confirmDelete && (
        <div className={styles.confirmRow}>
          <span>DELETE &quot;{confirmDelete.name}&quot;?</span>
          <button className={styles.confirmYes} onClick={() => void confirmDeleteYes()}>
            [Y] YES
          </button>
          <button className={styles.confirmNo} onClick={() => setConfirmDelete(null)}>
            [N] NO
          </button>
        </div>
      )}
      {showAdd && (
        <div className={styles.addRow}>
          <span className={styles.addLabel}>ADD CLIENT &gt;</span>
          <input
            ref={addInputRef}
            className={styles.addInput}
            placeholder="CLIENT NAME"
            value={addName}
            onChange={e => setAddName(e.currentTarget.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') void submitAdd()
              if (e.key === 'Escape') cancelAdd()
              e.stopPropagation()
            }}
          />
          <button className={styles.addSubmit} onClick={() => void submitAdd()}>
            [ENTER]
          </button>
        </div>
      )}
      <div className={styles.tableWrap}>
        <div className={styles.colHeader} style={{ gridTemplateColumns: '1fr 10ch' }}>
          <span>NAME</span>
          <span>SINCE</span>
        </div>
        {loading && <div className={styles.loading}>LOADING...</div>}
        {!loading && clients.length === 0 && (
          <div className={styles.empty}>NO CLIENTS - PRESS [A] TO ADD</div>
        )}
        {clients.map((client, idx) => (
          <div
            key={client.id}
            className={`${styles.row} ${idx === selectedIdx && !showAdd ? styles.rowSelected : ''}`}
            style={{ gridTemplateColumns: '1fr 10ch' }}
            onClick={() => setSelectedIdx(idx)}
          >
            <span
              className={styles.editableCell}
              title="Click to edit"
              onClick={e => {
                e.stopPropagation()
                setSelectedIdx(idx)
                setEditing({ id: client.id, value: client.name })
              }}
            >
              {editing?.id === client.id ? (
                <input
                  ref={editInputRef}
                  className={styles.inlineInput}
                  value={editing.value}
                  onChange={e => setEditing({ ...editing, value: e.currentTarget.value })}
                  onBlur={() => void commitEdit()}
                  onKeyDown={e => {
                    if (e.key === 'Enter') void commitEdit()
                    if (e.key === 'Escape') setEditing(null)
                    e.stopPropagation()
                  }}
                />
              ) : (
                client.name
              )}
            </span>
            <span className={styles.cellMeta}>
              {new Date(client.createdAt).toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: '2-digit'
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
