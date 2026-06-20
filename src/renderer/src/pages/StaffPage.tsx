import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useStaff } from '../../hooks/use-staff'
import { deriveInitials } from '../../../shared/utils/derive-initials'
import styles from './CrudPage.module.css'

interface EditingCell {
  id: string
  field: 'name' | 'initials'
  value: string
}

interface ConfirmDelete {
  id: string
  name: string
}

/** Staff management page with keyboard navigation and inline editing. */
export function StaffPage() {
  const { staff, loading, createStaff, updateStaff, toggleStatus, deleteStaff } = useStaff()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [showAdd, setShowAdd] = useState(false)
  const [addName, setAddName] = useState('')
  const [addInitials, setAddInitials] = useState('')
  const [editing, setEditing] = useState<EditingCell | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const pageRef = useRef<HTMLDivElement>(null)
  const addNameRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    pageRef.current?.focus()
  }, [])

  const clampIdx = useCallback(
    (idx: number) => Math.max(0, Math.min(idx, staff.length - 1)),
    [staff.length]
  )

  useEffect(() => {
    if (staff.length > 0) setSelectedIdx(i => clampIdx(i))
  }, [staff.length, clampIdx])

  useEffect(() => {
    if (showAdd) addNameRef.current?.focus()
  }, [showAdd])

  useEffect(() => {
    if (editing) editInputRef.current?.focus()
  }, [editing])

  const handleNavigationKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIdx(i => clampIdx(i - 1))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIdx(i => clampIdx(i + 1))
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        setShowAdd(true)
      } else if ((e.key === 'd' || e.key === 'D') && staff[selectedIdx]) {
        setConfirmDelete({ id: staff[selectedIdx].id, name: staff[selectedIdx].name })
      }
    },
    [clampIdx, staff, selectedIdx]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (editing || confirmDelete) return
      if (showAdd) {
        if (e.key === 'Escape') {
          setShowAdd(false)
          setAddName('')
          setAddInitials('')
          setErrorMsg('')
        }
        return
      }
      handleNavigationKey(e)
    },
    [editing, confirmDelete, showAdd, handleNavigationKey]
  )

  const submitAdd = async () => {
    if (!addName.trim()) {
      setErrorMsg('Name is required')
      return
    }
    await createStaff({
      name: addName.trim(),
      initials: addInitials.trim() || deriveInitials(addName.trim()),
      status: 'Active'
    })
    setAddName('')
    setAddInitials('')
    setShowAdd(false)
    setErrorMsg('')
  }

  const commitEdit = async () => {
    if (!editing) return
    if (!editing.value.trim()) {
      setEditing(null)
      return
    }
    await updateStaff(editing.id, { [editing.field]: editing.value.trim() })
    setEditing(null)
  }

  const confirmDeleteYes = async () => {
    if (!confirmDelete) return
    const result = await deleteStaff(confirmDelete.id)
    if (!result.deleted) {
      setErrorMsg(
        `Cannot delete "${confirmDelete.name}" - ${result.taskCount} task${result.taskCount === 1 ? '' : 's'} assigned`
      )
    }
    setConfirmDelete(null)
  }

  const openEdit = (id: string, field: 'name' | 'initials', value: string) => {
    setEditing({ id, field, value })
  }

  const elapsed = (createdAt: string) => {
    const ms = Date.now() - new Date(createdAt).getTime()
    const days = Math.floor(ms / 86400000)
    if (days === 0) return 'today'
    if (days === 1) return '1d'
    return `${days}d`
  }

  return (
    <div ref={pageRef} className={styles.page} onKeyDown={handleKeyDown} tabIndex={0}>
      <div className={styles.header}>
        <span className={styles.title}>STAFF</span>
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
          <button className={styles.confirmYes} onClick={confirmDeleteYes}>
            [Y] YES
          </button>
          <button className={styles.confirmNo} onClick={() => setConfirmDelete(null)}>
            [N] NO
          </button>
        </div>
      )}

      {showAdd && (
        <div className={styles.addRow}>
          <span className={styles.addLabel}>ADD STAFF &gt;</span>
          <input
            ref={addNameRef}
            className={styles.addInput}
            placeholder="FULL NAME"
            value={addName}
            onChange={e => setAddName(e.currentTarget.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') void submitAdd()
              if (e.key === 'Escape') {
                setShowAdd(false)
                setAddName('')
                setAddInitials('')
                setErrorMsg('')
              }
              e.stopPropagation()
            }}
          />
          <input
            className={styles.addInput}
            placeholder={addName ? deriveInitials(addName) : 'INITIALS'}
            value={addInitials}
            onChange={e => setAddInitials(e.currentTarget.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') void submitAdd()
              if (e.key === 'Escape') {
                setShowAdd(false)
                setAddName('')
                setAddInitials('')
                setErrorMsg('')
              }
              e.stopPropagation()
            }}
            style={{ width: '8ch' }}
          />
          <button className={styles.addSubmit} onClick={() => void submitAdd()}>
            [ENTER]
          </button>
        </div>
      )}

      <div className={styles.tableWrap}>
        <div className={styles.colHeader} style={{ gridTemplateColumns: '6ch 1fr 10ch 8ch' }}>
          <span>INIT</span>
          <span>NAME</span>
          <span>STATUS</span>
          <span>SINCE</span>
        </div>

        {loading && <div className={styles.loading}>LOADING...</div>}

        {!loading && staff.length === 0 && (
          <div className={styles.empty}>NO STAFF - PRESS [A] TO ADD</div>
        )}

        {staff.map((member, idx) => {
          const isSelected = idx === selectedIdx && !showAdd
          return (
            <div
              key={member.id}
              className={`${styles.row} ${isSelected ? styles.rowSelected : ''}`}
              style={{ gridTemplateColumns: '6ch 1fr 10ch 8ch' }}
              onClick={() => setSelectedIdx(idx)}
            >
              <span
                className={styles.cellAccent}
                title="Click to edit initials"
                onClick={e => {
                  e.stopPropagation()
                  setSelectedIdx(idx)
                  openEdit(member.id, 'initials', member.initials)
                }}
              >
                {editing?.id === member.id && editing.field === 'initials' ? (
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
                    style={{ width: '5ch' }}
                  />
                ) : (
                  member.initials
                )}
              </span>

              <span
                className={styles.editableCell}
                title="Click to edit name"
                onClick={e => {
                  e.stopPropagation()
                  setSelectedIdx(idx)
                  openEdit(member.id, 'name', member.name)
                }}
              >
                {editing?.id === member.id && editing.field === 'name' ? (
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
                  member.name
                )}
              </span>

              <span>
                <button
                  className={`${styles.statusBtn} ${member.status === 'Active' ? styles.active : styles.inactive}`}
                  onClick={e => {
                    e.stopPropagation()
                    void toggleStatus(member.id, member.status)
                  }}
                >
                  {member.status}
                </button>
              </span>

              <span className={styles.cellMeta}>{elapsed(member.createdAt)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
