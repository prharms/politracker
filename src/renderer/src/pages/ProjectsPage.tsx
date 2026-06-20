import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useProjects } from '../../hooks/use-projects'
import { useClients } from '../../hooks/use-clients'
import { PROJECT_TYPES, PROJECT_STATUSES } from '../../../shared/constants'
import styles from './CrudPage.module.css'
import type { ProjectDto } from '../../../shared/dtos/project-dto'

interface ConfirmDelete {
  id: string
  name: string
}

/** Projects management page. */
export function ProjectsPage() {
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects()
  const { clients } = useClients()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [showAdd, setShowAdd] = useState(false)
  const [addClientId, setAddClientId] = useState('')
  const [addName, setAddName] = useState('')
  const [addType, setAddType] = useState(PROJECT_TYPES[0])
  const [addStatus, setAddStatus] = useState(PROJECT_STATUSES[0])
  const [editingField, setEditingField] = useState<{
    id: string
    field: keyof ProjectDto
    value: string
  } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const pageRef = useRef<HTMLDivElement>(null)
  const addNameRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    pageRef.current?.focus()
  }, [])
  useEffect(() => {
    if (clients.length > 0 && !addClientId) setAddClientId(clients[0].id)
  }, [clients, addClientId])
  useEffect(() => {
    if (projects.length > 0) setSelectedIdx(i => Math.min(i, projects.length - 1))
  }, [projects.length])
  useEffect(() => {
    if (showAdd) addNameRef.current?.focus()
  }, [showAdd])
  useEffect(() => {
    if (editingField) editInputRef.current?.focus()
  }, [editingField])

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
    if (!addClientId) {
      setErrorMsg('Select a client')
      return
    }
    await createProject({
      clientId: addClientId,
      name: addName.trim(),
      type: addType,
      status: addStatus
    })
    setAddName('')
    setShowAdd(false)
    setErrorMsg('')
  }, [addName, addClientId, addType, addStatus, createProject])

  const commitEdit = useCallback(async () => {
    if (!editingField || !editingField.value.trim()) {
      setEditingField(null)
      return
    }
    await updateProject(editingField.id, { [editingField.field]: editingField.value.trim() })
    setEditingField(null)
  }, [editingField, updateProject])

  const confirmDeleteYes = useCallback(async () => {
    if (!confirmDelete) return
    const result = await deleteProject(confirmDelete.id)
    if (!result.deleted)
      setErrorMsg(
        `Cannot delete - ${result.taskCount} task${result.taskCount === 1 ? '' : 's'} exist`
      )
    setConfirmDelete(null)
  }, [confirmDelete, deleteProject])

  const handleNavKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIdx(i => Math.max(0, i - 1))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIdx(i => Math.min(i, projects.length - 1))
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        setShowAdd(true)
      } else if ((e.key === 'd' || e.key === 'D') && projects[selectedIdx]) {
        setConfirmDelete({ id: projects[selectedIdx].id, name: projects[selectedIdx].name })
      }
    },
    [projects, selectedIdx]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (editingField || confirmDelete) return
      if (showAdd) {
        if (e.key === 'Escape') cancelAdd()
        return
      }
      handleNavKey(e)
    },
    [editingField, confirmDelete, showAdd, cancelAdd, handleNavKey]
  )

  const openEdit = (id: string, field: keyof ProjectDto, value: string) => {
    setEditingField({ id, field, value })
  }

  return (
    <div ref={pageRef} className={styles.page} onKeyDown={handleKeyDown} tabIndex={0}>
      <div className={styles.header}>
        <span className={styles.title}>PROJECTS</span>
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
        <div className={styles.addRow} style={{ flexWrap: 'wrap', gap: '8px' }}>
          <span className={styles.addLabel}>ADD PROJECT &gt;</span>
          <select
            className={styles.addSelect}
            value={addClientId}
            onChange={e => setAddClientId(e.currentTarget.value)}
          >
            {clients.length === 0 && <option value="">-- add a client first --</option>}
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            ref={addNameRef}
            className={styles.addInput}
            placeholder="PROJECT NAME"
            value={addName}
            onChange={e => setAddName(e.currentTarget.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') void submitAdd()
              if (e.key === 'Escape') cancelAdd()
              e.stopPropagation()
            }}
          />
          <select
            className={styles.addSelect}
            value={addType}
            onChange={e => setAddType(e.currentTarget.value as typeof addType)}
          >
            {PROJECT_TYPES.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            className={styles.addSelect}
            value={addStatus}
            onChange={e => setAddStatus(e.currentTarget.value as typeof addStatus)}
          >
            {PROJECT_STATUSES.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button className={styles.addSubmit} onClick={() => void submitAdd()}>
            [ENTER]
          </button>
        </div>
      )}
      <div className={styles.tableWrap}>
        <div className={styles.colHeader} style={{ gridTemplateColumns: '18ch 1fr 16ch 10ch' }}>
          <span>CLIENT</span>
          <span>PROJECT NAME</span>
          <span>TYPE</span>
          <span>STATUS</span>
        </div>
        {loading && <div className={styles.loading}>LOADING...</div>}
        {!loading && projects.length === 0 && (
          <div className={styles.empty}>NO PROJECTS - PRESS [A] TO ADD</div>
        )}
        {projects.map((proj, idx) => (
          <div
            key={proj.id}
            className={`${styles.row} ${idx === selectedIdx && !showAdd ? styles.rowSelected : ''}`}
            style={{ gridTemplateColumns: '18ch 1fr 16ch 10ch' }}
            onClick={() => setSelectedIdx(idx)}
          >
            <span className={styles.cellMeta}>{proj.clientName}</span>
            <span
              className={styles.editableCell}
              title="Click to edit"
              onClick={e => {
                e.stopPropagation()
                setSelectedIdx(idx)
                openEdit(proj.id, 'name', proj.name)
              }}
            >
              {editingField?.id === proj.id && editingField.field === 'name' ? (
                <input
                  ref={editInputRef}
                  className={styles.inlineInput}
                  value={editingField.value}
                  onChange={e => setEditingField({ ...editingField, value: e.currentTarget.value })}
                  onBlur={() => void commitEdit()}
                  onKeyDown={e => {
                    if (e.key === 'Enter') void commitEdit()
                    if (e.key === 'Escape') setEditingField(null)
                    e.stopPropagation()
                  }}
                />
              ) : (
                proj.name
              )}
            </span>
            <span className={styles.cellMeta}>{proj.type}</span>
            <span
              className={`${styles.cellMeta} ${proj.status === 'Active' ? styles.active : styles.inactive}`}
            >
              {proj.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
