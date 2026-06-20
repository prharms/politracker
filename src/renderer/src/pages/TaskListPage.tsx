import React, { useState, useEffect, useRef, useCallback } from 'react'
import styles from './CrudPage.module.css'
import { useTasks } from '../../hooks/use-tasks'
import { useFilterOptions } from '../../hooks/use-filter-options'
import type { TaskDto, TaskListFilters } from '../../../shared/dtos/task-dto'
import { TASK_SCOPES, TASK_PRIORITIES, TASK_STATUSES } from '../../../shared/constants'
import type { TaskScope, TaskPriority } from '../../../shared/constants'

const COLS = '1fr 14ch 14ch 12ch 8ch 8ch 6ch'

/** Format elapsed time since a given ISO timestamp. */
function formatAge(isoString: string): string {
  const ms = Date.now() - new Date(isoString).getTime()
  const days = Math.floor(ms / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return '1d'
  return `${days}d`
}

/** Return true if the task has been open for more than 7 days. */
function isStale(task: TaskDto): boolean {
  return task.status !== 'Closed' && Date.now() - new Date(task.createdAt).getTime() > 7 * 86400000
}

interface ConfirmDelete {
  id: string
  title: string
}

interface TaskItemProps {
  task: TaskDto
  selected: boolean
  onSelect: () => void
}

/** A single task row rendered inside the task list table. */
function TaskItem({ task, selected, onSelect }: TaskItemProps) {
  const closed = task.status === 'Closed'
  const urgent = task.priority === 'Urgent' && !closed
  const stale = isStale(task)
  return (
    <div
      className={`${styles.row} ${selected ? styles.rowSelected : ''}`}
      style={{ gridTemplateColumns: COLS, opacity: closed ? 0.45 : 1 }}
      onClick={onSelect}
    >
      <span
        className={styles.editableCell}
        style={urgent ? { color: '#ff3333' } : undefined}
        title={task.title}
      >
        {task.title}
      </span>
      <span className={styles.cellMeta} title={task.projectName}>
        {task.projectName}
      </span>
      <span className={styles.cellMeta} title={task.scope}>
        {task.scope}
      </span>
      <span className={styles.cellMeta}>{task.status}</span>
      <span className={styles.cellMeta} style={urgent ? { color: '#ff3333' } : undefined}>
        {task.priority}
      </span>
      <span className={styles.cellMeta}>{task.staffName ?? '-'}</span>
      <span className={styles.cellMeta} style={stale ? { color: '#ff3333' } : undefined}>
        {formatAge(task.createdAt)}
      </span>
    </div>
  )
}

interface AddTaskFormProps {
  projectOptions: { id: string; name: string }[]
  staffOptions: { id: string; name: string }[]
  addProjectId: string
  addStaffId: string
  addTitle: string
  addScope: TaskScope
  addPriority: TaskPriority
  onProjectChange: (v: string) => void
  onStaffChange: (v: string) => void
  onTitleChange: (v: string) => void
  onScopeChange: (v: TaskScope) => void
  onPriorityChange: (v: TaskPriority) => void
  onSubmit: () => void
  onCancel: () => void
  titleRef: React.RefObject<HTMLInputElement | null>
}

/** Inline add-task form rendered above the table when showAdd is true. */
function AddTaskForm({
  projectOptions,
  staffOptions,
  addProjectId,
  addStaffId,
  addTitle,
  addScope,
  addPriority,
  onProjectChange,
  onStaffChange,
  onTitleChange,
  onScopeChange,
  onPriorityChange,
  onSubmit,
  onCancel,
  titleRef
}: AddTaskFormProps) {
  return (
    <div className={styles.addRow} style={{ flexWrap: 'wrap', gap: '8px' }}>
      <span className={styles.addLabel}>ADD TASK &gt;</span>
      <select
        className={styles.addSelect}
        value={addProjectId}
        onChange={e => onProjectChange(e.currentTarget.value)}
        aria-label="Project"
      >
        {projectOptions.length === 0 && <option value="">-- no projects --</option>}
        {projectOptions.map(p => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <select
        className={styles.addSelect}
        value={addStaffId}
        onChange={e => onStaffChange(e.currentTarget.value)}
        aria-label="Staff"
      >
        <option value="">-- unassigned --</option>
        {staffOptions.map(s => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <input
        ref={titleRef}
        className={styles.addInput}
        placeholder="WHAT NEEDS TO BE DONE"
        value={addTitle}
        onChange={e => onTitleChange(e.currentTarget.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') onSubmit()
          if (e.key === 'Escape') onCancel()
          e.stopPropagation()
        }}
      />
      <select
        className={styles.addSelect}
        value={addScope}
        onChange={e => onScopeChange(e.currentTarget.value as TaskScope)}
        aria-label="Scope"
      >
        {TASK_SCOPES.map(s => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        className={styles.addSelect}
        value={addPriority}
        onChange={e => onPriorityChange(e.currentTarget.value as TaskPriority)}
        aria-label="Priority"
      >
        {TASK_PRIORITIES.map(p => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <button className={styles.addSubmit} onClick={onSubmit}>
        [ENTER]
      </button>
    </div>
  )
}

/** Task list page with full CRUD, keyboard navigation, and compact filters. */
export function TaskListPage() {
  const [filters, setFilters] = useState<TaskListFilters>({})
  const { tasks, loading, createTask, deleteTask } = useTasks(filters)
  const { staff, projects } = useFilterOptions()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [showAdd, setShowAdd] = useState(false)
  const [addProjectId, setAddProjectId] = useState('')
  const [addStaffId, setAddStaffId] = useState('')
  const [addTitle, setAddTitle] = useState('')
  const [addScope, setAddScope] = useState<TaskScope>(TASK_SCOPES[0])
  const [addPriority, setAddPriority] = useState<TaskPriority>('Normal')
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const pageRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    pageRef.current?.focus()
  }, [])

  useEffect(() => {
    if (projects.length > 0 && !addProjectId) setAddProjectId(projects[0]!.id)
  }, [projects, addProjectId])

  useEffect(() => {
    if (tasks.length > 0) setSelectedIdx(i => Math.min(i, tasks.length - 1))
  }, [tasks.length])

  useEffect(() => {
    if (showAdd) titleRef.current?.focus()
  }, [showAdd])

  const cancelAdd = useCallback(() => {
    setShowAdd(false)
    setAddTitle('')
    setErrorMsg('')
  }, [])

  const submitAdd = useCallback(async () => {
    if (!addTitle.trim()) {
      setErrorMsg('Title is required')
      return
    }
    if (!addProjectId) {
      setErrorMsg('Select a project')
      return
    }
    await createTask({
      projectId: addProjectId,
      staffId: addStaffId || undefined,
      title: addTitle.trim(),
      scope: addScope,
      status: 'Backlog',
      priority: addPriority
    })
    setAddTitle('')
    setShowAdd(false)
    setErrorMsg('')
  }, [addTitle, addProjectId, addStaffId, addScope, addPriority, createTask])

  const confirmDeleteYes = useCallback(async () => {
    if (!confirmDelete) return
    await deleteTask(confirmDelete.id)
    setConfirmDelete(null)
  }, [confirmDelete, deleteTask])

  const handleNavKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIdx(i => Math.max(0, i - 1))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIdx(i => Math.min(i, tasks.length - 1))
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        setShowAdd(true)
      } else if ((e.key === 'd' || e.key === 'D') && tasks[selectedIdx]) {
        e.preventDefault()
        setConfirmDelete({ id: tasks[selectedIdx].id, title: tasks[selectedIdx].title })
      }
    },
    [tasks, selectedIdx]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (confirmDelete) return
      if (showAdd) {
        if (e.key === 'Escape') cancelAdd()
        return
      }
      handleNavKey(e)
    },
    [confirmDelete, showAdd, cancelAdd, handleNavKey]
  )

  return (
    <div ref={pageRef} className={styles.page} onKeyDown={handleKeyDown} tabIndex={0}>
      <div className={styles.header}>
        <span className={styles.title}>TASKS</span>
        <span className={styles.hint}>
          {showAdd ? '[ESC] CANCEL' : '[A] ADD  [D] DELETE  [UP/DOWN] SELECT'}
        </span>
      </div>
      <div className={styles.filterRow}>
        <span className={styles.addLabel}>FILTER:</span>
        <select
          className={styles.addSelect}
          value={filters.staffId ?? ''}
          onChange={e => setFilters(f => ({ ...f, staffId: e.currentTarget.value || undefined }))}
        >
          <option value="">ALL STAFF</option>
          {staff.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          className={styles.addSelect}
          value={filters.projectId ?? ''}
          onChange={e => setFilters(f => ({ ...f, projectId: e.currentTarget.value || undefined }))}
        >
          <option value="">ALL PROJECTS</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          className={styles.addSelect}
          value={filters.status ?? ''}
          onChange={e =>
            setFilters(f => ({
              ...f,
              status: (e.currentTarget.value || undefined) as TaskListFilters['status']
            }))
          }
        >
          <option value="">ALL STATUS</option>
          {TASK_STATUSES.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {errorMsg && (
        <div className={styles.error} onClick={() => setErrorMsg('')}>
          {errorMsg}
        </div>
      )}

      {confirmDelete && (
        <div className={styles.confirmRow}>
          <span>DELETE &quot;{confirmDelete.title}&quot;?</span>
          <button className={styles.confirmYes} onClick={() => void confirmDeleteYes()}>
            [Y] YES
          </button>
          <button className={styles.confirmNo} onClick={() => setConfirmDelete(null)}>
            [N] NO
          </button>
        </div>
      )}

      {showAdd && (
        <AddTaskForm
          projectOptions={projects}
          staffOptions={staff}
          addProjectId={addProjectId}
          addStaffId={addStaffId}
          addTitle={addTitle}
          addScope={addScope}
          addPriority={addPriority}
          onProjectChange={setAddProjectId}
          onStaffChange={setAddStaffId}
          onTitleChange={setAddTitle}
          onScopeChange={setAddScope}
          onPriorityChange={(v: TaskPriority) => setAddPriority(v)}
          onSubmit={() => void submitAdd()}
          onCancel={cancelAdd}
          titleRef={titleRef}
        />
      )}

      <div className={styles.tableWrap}>
        <div className={styles.colHeader} style={{ gridTemplateColumns: COLS }}>
          <span>TITLE</span>
          <span>PROJECT</span>
          <span>SCOPE</span>
          <span>STATUS</span>
          <span>PRI</span>
          <span>STAFF</span>
          <span>AGE</span>
        </div>
        {loading ? (
          <div className={styles.loading}>LOADING...</div>
        ) : tasks.length === 0 ? (
          <div className={styles.empty}>NO TASKS - PRESS [A] TO ADD</div>
        ) : null}
        {tasks.map((task, idx) => (
          <TaskItem
            key={task.id}
            task={task}
            selected={idx === selectedIdx && !showAdd}
            onSelect={() => setSelectedIdx(idx)}
          />
        ))}
      </div>
    </div>
  )
}
