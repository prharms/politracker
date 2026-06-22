import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useProjects } from '../../hooks/use-projects'
import { useSubprojects } from '../../hooks/use-subprojects'
import { PROJECT_TYPES, PROJECT_STATUSES, SUBPROJECT_STATUSES } from '../../../shared/constants'
import { formatDue, isOverdue } from '../../../shared/utils/days-until'
import styles from './CrudPage.module.css'
import type { ProjectDto } from '../../../shared/dtos/project-dto'

/** Advance to the next value in a status cycle list. */
function cycleStatus<T extends string>(current: T, values: readonly T[]): T {
  const idx = values.indexOf(current)
  return values[(idx + 1) % values.length]!
}

/** Return the CSS class name for a given status string. */
function statusClass(status: string, activeClass: string, inactiveClass: string): string {
  return status === 'Active' ? activeClass : inactiveClass
}

/** Return the toggle button label for a show-all / active-only control. */
function showAllLabel(showAll: boolean): string {
  return showAll ? '[ACTIVE ONLY]' : '[SHOW ALL]'
}

interface ConfirmDelete {
  id: string
  name: string
}

interface SubprojectPanelProps {
  projectId: string
  projectName: string
  projectDueDate: string
}

/** Subproject list with inline CRUD for the selected project. */
function SubprojectPanel({ projectId, projectName, projectDueDate }: SubprojectPanelProps) {
  const { subprojects, createSubproject, updateSubproject, deleteSubproject } =
    useSubprojects(projectId)
  const [showAdd, setShowAdd] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [addName, setAddName] = useState('')
  const [addDueDate, setAddDueDate] = useState('')
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
    if (!addDueDate) {
      setErrorMsg('Due date is required')
      return
    }
    await createSubproject({ projectId, name: addName.trim(), dueDate: addDueDate })
    setAddName('')
    setAddDueDate('')
    setShowAdd(false)
    setErrorMsg('')
  }, [addName, addDueDate, projectId, createSubproject])

  const commitEdit = useCallback(async () => {
    if (!editingId || !editingValue.trim()) {
      setEditingId(null)
      return
    }
    await updateSubproject(editingId, { name: editingValue.trim() })
    setEditingId(null)
  }, [editingId, editingValue, updateSubproject])

  const cycleSubprojectStatus = useCallback(
    async (id: string, current: (typeof SUBPROJECT_STATUSES)[number]) => {
      await updateSubproject(id, { status: cycleStatus(current, SUBPROJECT_STATUSES) })
    },
    [updateSubproject]
  )

  const confirmDeleteYes = useCallback(async () => {
    if (!confirmDelete) return
    const result = await deleteSubproject(confirmDelete.id)
    if (!result.deleted) setErrorMsg(result.reason ?? 'Cannot delete')
    setConfirmDelete(null)
  }, [confirmDelete, deleteSubproject])

  /** Compute the effective due date for a subproject (inherit from project if "None"). */
  function effectiveDue(dueDate: string | null): string {
    return dueDate ?? projectDueDate
  }

  const visibleSubprojects = showAll ? subprojects : subprojects.filter(s => s.status === 'Active')

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
        <button
          className={styles.hint}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={() => setShowAll(v => !v)}
        >
          {showAllLabel(showAll)}
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
                setAddDueDate('')
              }
              e.stopPropagation()
            }}
          />
          <input
            type="date"
            className={styles.addInput}
            style={{ width: '14ch' }}
            value={addDueDate}
            onChange={e => setAddDueDate(e.currentTarget.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') void submitAdd()
              if (e.key === 'Escape') {
                setShowAdd(false)
                setAddDueDate('')
              }
              e.stopPropagation()
            }}
          />
          <button className={styles.addSubmit} onClick={() => void submitAdd()}>
            [ENTER]
          </button>
        </div>
      )}
      {visibleSubprojects.length === 0 && <div className={styles.empty}>NO SUBPROJECTS</div>}
      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>NAME</th>
            <th style={{ width: '10ch', whiteSpace: 'nowrap' }}>STATUS</th>
            <th style={{ width: '9ch', whiteSpace: 'nowrap' }}>DUE</th>
            <th style={{ width: '6ch', whiteSpace: 'nowrap' }}>DEL</th>
          </tr>
        </thead>
        <tbody>
          {visibleSubprojects.map(sub => {
            const due = effectiveDue(sub.dueDate)
            const overdue = isOverdue(due)
            return (
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
                <td
                  className={statusClass(sub.status, styles.active, styles.inactive)}
                  style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                  title="Click to change status"
                  onClick={() => void cycleSubprojectStatus(sub.id, sub.status)}
                >
                  {sub.status}
                </td>
                <td style={{ whiteSpace: 'nowrap', ...(overdue ? { color: '#ff3333' } : {}) }}>
                  {formatDue(due)}
                </td>
                <td>
                  <button
                    className={styles.confirmNo}
                    style={{ fontSize: '0.85em', whiteSpace: 'nowrap' }}
                    onClick={() => setConfirmDelete({ id: sub.id, name: sub.name })}
                  >
                    [D]
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** Projects management page. */
export function ProjectsPage() {
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [addName, setAddName] = useState('')
  const [addType, setAddType] = useState(PROJECT_TYPES[0])
  const [addStatus, setAddStatus] = useState(PROJECT_STATUSES[0])
  const [addDueDate, setAddDueDate] = useState('')
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
    setAddDueDate('')
    setErrorMsg('')
  }, [])

  const submitAdd = useCallback(async () => {
    if (!addName.trim()) {
      setErrorMsg('Name is required')
      return
    }
    if (!addDueDate) {
      setErrorMsg('Due date is required')
      return
    }
    await createProject({
      name: addName.trim(),
      type: addType,
      status: addStatus,
      dueDate: addDueDate
    })
    setAddName('')
    setAddDueDate('')
    setShowAdd(false)
    setErrorMsg('')
  }, [addName, addDueDate, addType, addStatus, createProject])

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

  const cycleProjectStatus = useCallback(
    async (id: string, current: (typeof PROJECT_STATUSES)[number]) => {
      await updateProject(id, { status: cycleStatus(current, PROJECT_STATUSES) })
    },
    [updateProject]
  )

  const openEdit = (id: string, field: keyof ProjectDto, value: string) => {
    setEditingField({ id, field, value })
  }

  const visibleProjects = showAll ? projects : projects.filter(p => p.status === 'Active')
  const selectedProject = visibleProjects[selectedIdx]

  return (
    <div ref={pageRef} className={styles.page} onKeyDown={handleKeyDown} tabIndex={0}>
      <div className={styles.header}>
        <span className={styles.title}>PROJECTS</span>
        <span className={styles.hint}>
          {showAdd ? '[ESC] CANCEL' : '[A] ADD  [D] DELETE  [UP/DOWN] SELECT'}
        </span>
        <button
          className={styles.hint}
          style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}
          onClick={() => setShowAll(v => !v)}
        >
          {showAllLabel(showAll)}
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
        <div className={styles.addRow} style={{ flexWrap: 'wrap', gap: '8px' }}>
          <span className={styles.addLabel}>ADD PROJECT &gt;</span>
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
          <input
            type="date"
            className={styles.addInput}
            style={{ width: '14ch' }}
            value={addDueDate}
            onChange={e => setAddDueDate(e.currentTarget.value)}
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
        {loading && <div className={styles.loading}>LOADING...</div>}
        {!loading && visibleProjects.length === 0 && (
          <div className={styles.empty}>NO PROJECTS - PRESS [A] TO ADD</div>
        )}
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>PROJECT NAME</th>
              <th style={{ width: '20ch' }}>TYPE</th>
              <th style={{ width: '10ch', whiteSpace: 'nowrap' }}>STATUS</th>
              <th style={{ width: '9ch', whiteSpace: 'nowrap' }}>DUE</th>
            </tr>
          </thead>
          <tbody>
            {visibleProjects.map((proj, idx) => {
              const overdue = isOverdue(proj.dueDate)
              return (
                <tr
                  key={proj.id}
                  className={idx === selectedIdx && !showAdd ? styles.rowSelected : ''}
                  onClick={() => setSelectedIdx(idx)}
                >
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
                  <td
                    className={statusClass(proj.status, styles.active, styles.inactive)}
                    style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                    title="Click to change status"
                    onClick={e => {
                      e.stopPropagation()
                      void cycleProjectStatus(proj.id, proj.status)
                    }}
                  >
                    {proj.status}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', ...(overdue ? { color: '#ff3333' } : {}) }}>
                    {formatDue(proj.dueDate)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectedProject && (
        <SubprojectPanel
          key={selectedProject.id}
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          projectDueDate={selectedProject.dueDate}
        />
      )}
    </div>
  )
}
