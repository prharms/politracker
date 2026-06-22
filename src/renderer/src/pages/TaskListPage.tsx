import React, { useState, useEffect, useRef, useCallback } from 'react'
import styles from './CrudPage.module.css'
import { useTasks } from '../../hooks/use-tasks'
import { useFilterOptions } from '../../hooks/use-filter-options'
import { useSubprojects } from '../../hooks/use-subprojects'
import { formatDue, isOverdue } from '../../../shared/utils/days-until'
import type { TaskDto, TaskListFilters, UpdateTaskInput } from '../../../shared/dtos/task-dto'
import { TASK_SCOPES, TASK_PRIORITIES, TASK_STATUSES } from '../../../shared/constants'
import type { TaskScope, TaskPriority } from '../../../shared/constants'

/** Return the staff member's name, or a placeholder if unassigned. */
function staffLabel(name: string | null): string {
  return name ?? '-'
}

/** Advance to the next value in a cycle list. */
function cycleStatus<T extends string>(current: T, values: readonly T[]): T {
  const idx = values.indexOf(current)
  return values[(idx + 1) % values.length]!
}

/** Return a red color style for urgent items, or undefined. */
function urgentStyle(urgent: boolean): React.CSSProperties | undefined {
  return urgent ? { color: '#ff3333' } : undefined
}

/** Return a red color style for overdue items, or undefined. */
function overdueStyle(overdue: boolean): React.CSSProperties | undefined {
  return overdue ? { color: '#ff3333' } : undefined
}

/** Build the combined project/subproject label for a task. */
function taskProjectLabel(task: TaskDto): string {
  if (task.subprojectName && task.subprojectName !== 'None') {
    return `${task.projectName}/${task.subprojectName}`
  }
  return task.projectName
}

/** Renders loading indicator or empty-state message for the task table. */
function TaskTableStatus({ loading, count }: { loading: boolean; count: number }) {
  if (loading) return <div className={styles.loading}>LOADING...</div>
  if (count === 0) return <div className={styles.empty}>NO TASKS - PRESS [A] TO ADD</div>
  return null
}

interface ConfirmDelete {
  id: string
  title: string
}

interface TaskItemProps {
  task: TaskDto
  selected: boolean
  staffOptions: { id: string; name: string }[]
  onSelect: () => void
  onUpdate: (id: string, input: UpdateTaskInput) => Promise<TaskDto>
}

/** A single task row with inline editing for all fields. */
function TaskItem({ task, selected, staffOptions, onSelect, onUpdate }: TaskItemProps) {
  const [editField, setEditField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const closed = task.status === 'Complete'
  const urgent = task.priority === 'Urgent' && !closed
  const overdue = !closed && isOverdue(task.dueDate)
  const project = taskProjectLabel(task)

  const startEdit = useCallback((field: string, value: string) => {
    setEditField(field)
    setEditValue(value)
  }, [])

  const cancelEdit = useCallback(() => {
    setEditField(null)
  }, [])

  const commitEdit = useCallback(async () => {
    if (!editField || !editValue.trim()) {
      setEditField(null)
      return
    }
    if (editField === 'title') {
      await onUpdate(task.id, { title: editValue.trim() })
    } else {
      await onUpdate(task.id, { dueDate: editValue })
    }
    setEditField(null)
  }, [editField, editValue, task.id, onUpdate])

  const cycleField = useCallback(
    async (field: 'scope' | 'status' | 'priority') => {
      if (field === 'scope') {
        await onUpdate(task.id, { scope: cycleStatus(task.scope, TASK_SCOPES) })
      } else if (field === 'priority') {
        await onUpdate(task.id, { priority: cycleStatus(task.priority, TASK_PRIORITIES) })
      } else {
        await onUpdate(task.id, { status: cycleStatus(task.status, TASK_STATUSES) })
      }
    },
    [task, onUpdate]
  )

  return (
    <tr
      className={selected ? styles.rowSelected : ''}
      style={{ opacity: closed ? 0.45 : 1 }}
      onClick={onSelect}
    >
      <td
        className={styles.editableCell}
        style={urgentStyle(urgent)}
        title="Click to edit title"
        onClick={e => {
          e.stopPropagation()
          startEdit('title', task.title)
        }}
      >
        {editField === 'title' ? (
          <input
            autoFocus
            className={styles.inlineInput}
            value={editValue}
            onChange={e => setEditValue(e.currentTarget.value)}
            onBlur={() => void commitEdit()}
            onKeyDown={e => {
              if (e.key === 'Enter') void commitEdit()
              if (e.key === 'Escape') cancelEdit()
              e.stopPropagation()
            }}
          />
        ) : (
          task.title
        )}
      </td>
      <td>{project}</td>
      <td
        style={{ cursor: 'pointer' }}
        title="Click to change scope"
        onClick={e => {
          e.stopPropagation()
          void cycleField('scope')
        }}
      >
        {task.scope}
      </td>
      <td
        style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
        title="Click to change status"
        onClick={e => {
          e.stopPropagation()
          void cycleField('status')
        }}
      >
        {task.status}
      </td>
      <td
        style={{ ...urgentStyle(urgent), cursor: 'pointer' }}
        title="Click to change priority"
        onClick={e => {
          e.stopPropagation()
          void cycleField('priority')
        }}
      >
        {task.priority}
      </td>
      <td
        className={styles.editableCell}
        title="Click to change staff"
        onClick={e => {
          e.stopPropagation()
          startEdit('staffId', task.staffId ?? '')
        }}
      >
        {editField === 'staffId' ? (
          <select
            autoFocus
            className={styles.addSelect}
            value={editValue}
            onChange={e => {
              void onUpdate(task.id, { staffId: e.currentTarget.value || null })
              setEditField(null)
            }}
            onBlur={cancelEdit}
          >
            <option value="">-- unassigned --</option>
            {staffOptions.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        ) : (
          staffLabel(task.staffName)
        )}
      </td>
      <td
        className={styles.editableCell}
        style={overdueStyle(overdue)}
        title="Click to edit due date"
        onClick={e => {
          e.stopPropagation()
          startEdit('dueDate', task.dueDate)
        }}
      >
        {editField === 'dueDate' ? (
          <input
            autoFocus
            type="date"
            className={styles.inlineInput}
            value={editValue}
            onChange={e => setEditValue(e.currentTarget.value)}
            onBlur={() => void commitEdit()}
            onKeyDown={e => {
              if (e.key === 'Enter') void commitEdit()
              if (e.key === 'Escape') cancelEdit()
              e.stopPropagation()
            }}
          />
        ) : (
          formatDue(task.dueDate)
        )}
      </td>
    </tr>
  )
}

interface AddTaskFormProps {
  projectOptions: { id: string; name: string }[]
  subprojectOptions: { id: string; name: string }[]
  staffOptions: { id: string; name: string }[]
  addProjectId: string
  addSubprojectId: string
  addStaffId: string
  addTitle: string
  addScope: TaskScope
  addPriority: TaskPriority
  addDueDate: string
  onProjectChange: (v: string) => void
  onSubprojectChange: (v: string) => void
  onStaffChange: (v: string) => void
  onTitleChange: (v: string) => void
  onScopeChange: (v: TaskScope) => void
  onPriorityChange: (v: TaskPriority) => void
  onDueDateChange: (v: string) => void
  onSubmit: () => void
  onCancel: () => void
  titleRef: React.RefObject<HTMLInputElement | null>
}

/** Inline add-task form rendered above the table when showAdd is true. */
function AddTaskForm({
  projectOptions,
  subprojectOptions,
  staffOptions,
  addProjectId,
  addSubprojectId,
  addStaffId,
  addTitle,
  addScope,
  addPriority,
  addDueDate,
  onProjectChange,
  onSubprojectChange,
  onStaffChange,
  onTitleChange,
  onScopeChange,
  onPriorityChange,
  onDueDateChange,
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
        value={addSubprojectId}
        onChange={e => onSubprojectChange(e.currentTarget.value)}
        aria-label="Subproject"
      >
        {subprojectOptions.length === 0 && <option value="">-- no subprojects --</option>}
        {subprojectOptions.map(s => (
          <option key={s.id} value={s.id}>
            {s.name}
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
      <input
        type="date"
        className={styles.addInput}
        style={{ width: '14ch' }}
        value={addDueDate}
        onChange={e => onDueDateChange(e.currentTarget.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') onSubmit()
          if (e.key === 'Escape') onCancel()
          e.stopPropagation()
        }}
        aria-label="Due date"
      />
      <button className={styles.addSubmit} onClick={onSubmit}>
        [ENTER]
      </button>
    </div>
  )
}

/** Task list page with full CRUD, keyboard navigation, and compact filters. */
export function TaskListPage() {
  const [filters, setFilters] = useState<TaskListFilters>({})
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks(filters)
  const { staff, projects } = useFilterOptions()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [addProjectId, setAddProjectId] = useState('')
  const [addSubprojectId, setAddSubprojectId] = useState('')
  const [addStaffId, setAddStaffId] = useState('')
  const [addTitle, setAddTitle] = useState('')
  const [addScope, setAddScope] = useState<TaskScope>(TASK_SCOPES[0])
  const [addPriority, setAddPriority] = useState<TaskPriority>('Normal')
  const [addDueDate, setAddDueDate] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const pageRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  const { subprojects: addSubprojects } = useSubprojects(addProjectId || null)

  useEffect(() => {
    pageRef.current?.focus()
  }, [])

  useEffect(() => {
    if (projects.length > 0 && !addProjectId) setAddProjectId(projects[0]!.id)
  }, [projects, addProjectId])

  useEffect(() => {
    if (addSubprojects.length > 0) {
      const noneEntry = addSubprojects.find(s => s.name === 'None')
      setAddSubprojectId(noneEntry ? noneEntry.id : addSubprojects[0]!.id)
    } else {
      setAddSubprojectId('')
    }
  }, [addSubprojects])

  useEffect(() => {
    if (tasks.length > 0) setSelectedIdx(i => Math.min(i, tasks.length - 1))
  }, [tasks.length])

  useEffect(() => {
    if (showAdd) titleRef.current?.focus()
  }, [showAdd])

  const handleProjectChange = useCallback((v: string) => {
    setAddProjectId(v)
    setAddSubprojectId('')
  }, [])

  const cancelAdd = useCallback(() => {
    setShowAdd(false)
    setAddTitle('')
    setAddDueDate('')
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
    if (!addSubprojectId) {
      setErrorMsg('Select a subproject')
      return
    }
    if (!addDueDate) {
      setErrorMsg('Due date is required')
      return
    }
    await createTask({
      projectId: addProjectId,
      subprojectId: addSubprojectId,
      staffId: addStaffId || undefined,
      title: addTitle.trim(),
      scope: addScope,
      status: 'Active',
      priority: addPriority,
      dueDate: addDueDate
    })
    setAddTitle('')
    setAddDueDate('')
    setShowAdd(false)
    setErrorMsg('')
  }, [
    addTitle,
    addProjectId,
    addSubprojectId,
    addStaffId,
    addScope,
    addPriority,
    addDueDate,
    createTask
  ])

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
          style={{ flex: 1 }}
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
          style={{ flex: 1 }}
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
          style={{ flex: 1 }}
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
        <button
          className={styles.confirmNo}
          style={{ whiteSpace: 'nowrap', fontSize: '20px' }}
          onClick={() => setShowAll(v => !v)}
        >
          {showAll ? '[ACTIVE ONLY]' : '[SHOW ALL]'}
        </button>
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
          subprojectOptions={addSubprojects}
          staffOptions={staff}
          addProjectId={addProjectId}
          addSubprojectId={addSubprojectId}
          addStaffId={addStaffId}
          addTitle={addTitle}
          addScope={addScope}
          addPriority={addPriority}
          addDueDate={addDueDate}
          onProjectChange={handleProjectChange}
          onSubprojectChange={setAddSubprojectId}
          onStaffChange={setAddStaffId}
          onTitleChange={setAddTitle}
          onScopeChange={setAddScope}
          onPriorityChange={(v: TaskPriority) => setAddPriority(v)}
          onDueDateChange={setAddDueDate}
          onSubmit={() => void submitAdd()}
          onCancel={cancelAdd}
          titleRef={titleRef}
        />
      )}

      <div className={styles.tableWrap}>
        <TaskTableStatus loading={loading} count={tasks.length} />
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>TITLE</th>
              <th style={{ width: '16ch' }}>PROJECT</th>
              <th style={{ width: '12ch' }}>SCOPE</th>
              <th style={{ width: '10ch', whiteSpace: 'nowrap' }}>STATUS</th>
              <th style={{ width: '10ch', whiteSpace: 'nowrap' }}>PRI</th>
              <th style={{ width: '8ch' }}>STAFF</th>
              <th style={{ width: '9ch', whiteSpace: 'nowrap' }}>DUE</th>
            </tr>
          </thead>
          <tbody>
            {tasks
              .filter(t => showAll || t.status !== 'Complete')
              .map((task, idx) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  selected={idx === selectedIdx && !showAdd}
                  staffOptions={staff}
                  onSelect={() => setSelectedIdx(idx)}
                  onUpdate={updateTask}
                />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
