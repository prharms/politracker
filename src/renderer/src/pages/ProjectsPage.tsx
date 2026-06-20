import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useProjects } from '../../hooks/use-projects'
import { useClients } from '../../hooks/use-clients'
import { useSubprojects } from '../../hooks/use-subprojects'
import { PROJECT_TYPES, PROJECT_STATUSES } from '../../../shared/constants'
import styles from './CrudPage.module.css'
import type { ProjectDto } from '../../../shared/dtos/project-dto'

interface ConfirmDelete {
  id: string
  name: string
}

interface SubprojectPanelProps {
  projectId: string
  projectName: string
}

/** Subproject list with inline CRUD for the selected project. */
function SubprojectPanel({ projectId, projectName }: SubprojectPanelProps) {
  const { subprojects, createSubproject, updateSubproject, deleteSubproject } =
    useSubprojects(projectId)
  const [showAdd, setShowAdd] = useState(false)
  const [addName, setAddName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const addRef = useRef<HTMLInputElement>(null)
  const editRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showAdd) addRef.current?.focus()
  }, [showAdd])

  useEffect(() => {
    if (editingId) editRef.current?.focus()
  }, [editingId])

  const submitAdd = useCallback(async () => {
    if (!addName.trim()) {
      setErrorMsg('Name is required')
      return
    }
    await createSubproject({ projectId, name: addName.trim() })
    setAddName('')
    setShowAdd(false)
    setErrorMsg('')
  }, [addName, projectId, createSubproject])

  const commitEdit = useCallback(async () => {
    if (!editingId || !editingValue.trim()) {
      setEditingId(null)
      return
    }
    await updateSubproject(editingId, { name: editingValue.trim() })
    setEditingId(null)
  }, [editingId, editingValue, updateSubproject])

  const confirmDeleteYes = useCallback(async () => {
    if (!confirmDelete) return
    const result = await deleteSubproject(confirmDelete.id)
    if (!result.deleted) setErrorMsg(result.reason ?? 'Cannot delete')
    setConfirmDelete(null)
  }, [confirmDelete, deleteSubproject])

  return (
    <div className={styles.subSection}>
      <div className={styles.subHeader}>
        <span className={styles.subTitle}>SUBPROJECTS - {projectName}</span>
        <button
          className={styles.hint}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={() => setShowAdd(v => !v)}
        >
          [A] ADD
        </button>
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
          <span className={styles.addLabel}>NEW SUBPROJECT &gt;</span>
          <input
            ref={addRef}
            className={styles.addInput}
            placeholder="SUBPROJECT NAME"
            value={addName}
            onChange={e => setAddName(e.currentTarget.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') void submitAdd()
              if (e.key === 'Escape') {
                setShowAdd(false)
                setAddName('')
              }
              e.stopPropagation()
            }}
          />
          <button className={styles.addSubmit} onClick={() => void submitAdd()}>
            [ENTER]
          </button>
        </div>
      )}
      {subprojects.length === 0 && <div className={styles.empty}>NO SUBPROJECTS</div>}
      {subprojects.length > 0 && (
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>NAME</th>
              <th style={{ width: '6ch' }}>DEL</th>
            </tr>
          </thead>
          <tbody>
            {subprojects.map(sub => (
              <tr key={sub.id}>
                <td
                  className={styles.editableCell}
                  title="Click to rename"
                  onClick={() => {
                    setEditingId(sub.id)
                    setEditingValue(sub.name)
                  }}
                >
                  {editingId === sub.id ? (
                    <input
                      ref={editRef}
                      className={styles.inlineInput}
                      value={editingValue}
                      onChange={e => setEditingValue(e.currentTarget.value)}
                      onBlur={() => void commitEdit()}
                      onKeyDown={e => {
                        if (e.key === 'Enter') void commitEdit()
                        if (e.key === 'Escape') setEditingId(null)
                        e.stopPropagation()
                      }}
                    />
                  ) : (
                    sub.name
                  )}
                </td>
                <td>
                  <button
                    className={styles.confirmNo}
                    style={{ fontSize: '0.85em' }}
                    onClick={() => setConfirmDelete({ id: sub.id, name: sub.name })}
                  >
                    [D]
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
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

  const selectedProject = projects[selectedIdx]

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
        {loading && <div className={styles.loading}>LOADING...</div>}
        {!loading && projects.length === 0 && (
          <div className={styles.empty}>NO PROJECTS - PRESS [A] TO ADD</div>
        )}
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th style={{ width: '16ch' }}>CLIENT</th>
              <th>PROJECT NAME</th>
              <th style={{ width: '20ch' }}>TYPE</th>
              <th style={{ width: '10ch' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((proj, idx) => (
              <tr
                key={proj.id}
                className={idx === selectedIdx && !showAdd ? styles.rowSelected : ''}
                onClick={() => setSelectedIdx(idx)}
              >
                <td>{proj.clientName}</td>
                <td
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
                      onChange={e =>
                        setEditingField({ ...editingField, value: e.currentTarget.value })
                      }
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
                </td>
                <td>{proj.type}</td>
                <td className={proj.status === 'Active' ? styles.active : styles.inactive}>
                  {proj.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedProject && (
        <SubprojectPanel
          key={selectedProject.id}
          projectId={selectedProject.id}
          projectName={selectedProject.name}
        />
      )}
    </div>
  )
}
