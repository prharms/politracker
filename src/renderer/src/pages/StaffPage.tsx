import React, { useState, useEffect, useRef } from 'react'
import { useStaff } from '../../../renderer/hooks/use-staff'
import styles from './StaffPage.module.css'

/** Staff directory with inline add form triggered by [A]. */
export function StaffPage(): React.JSX.Element {
  const { staff, loading, createStaff, toggleStatus } = useStaff()
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const target = e.target as HTMLElement
      if (target?.tagName === 'INPUT') return
      if (e.key === 'a' || e.key === 'A') {
        setAdding(true)
      }
      if (e.key === 'Escape') {
        setAdding(false)
        setNewName('')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    await createStaff({ name: newName.trim(), status: 'Active' })
    setNewName('')
    setAdding(false)
    setSaving(false)
  }

  const handleCancel = (): void => {
    setAdding(false)
    setNewName('')
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.col_name}>NAME</span>
        <span className={styles.col_status}>STATUS</span>
        <span className={styles.col_since}>MEMBER SINCE</span>
      </div>

      {adding && (
        <form className={styles.addRow} onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className={styles.addInput}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Full name..."
            disabled={saving}
            onKeyDown={e => e.key === 'Escape' && handleCancel()}
          />
          <button type="submit" className={styles.addBtn} disabled={saving || !newName.trim()}>
            {saving ? 'SAVING...' : 'ADD'}
          </button>
          <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
            CANCEL
          </button>
        </form>
      )}

      {loading && <div className={styles.empty}>LOADING...</div>}

      {!loading && staff.length === 0 && !adding && (
        <div className={styles.empty}>NO STAFF - PRESS [A] TO ADD</div>
      )}

      {!loading &&
        staff.map(member => (
          <div key={member.id} className={styles.row}>
            <span className={styles.col_name}>{member.name}</span>
            <button
              className={member.status === 'Active' ? styles.statusActive : styles.statusInactive}
              onClick={() => toggleStatus(member.id, member.status)}
            >
              {member.status.toUpperCase()}
            </button>
            <span className={styles.col_since}>
              {new Date(member.createdAt).toLocaleDateString('en-US')}
            </span>
          </div>
        ))}

      <div className={styles.footer}>[A] ADD STAFF</div>
    </div>
  )
}
