import React, { useState, useEffect, useRef, useCallback } from 'react'
import styles from './CrudPage.module.css'
import { useTasks } from '../../hooks/use-tasks'
import { useFilterOptions } from '../../hooks/use-filter-options'
import { apiListSubjects } from '../../api/subjects-api'
import type { TaskDto, TaskListFilters } from '../../../shared/dtos/task-dto'
import type { SubjectDto } from '../../../shared/dtos/subject-dto'
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  RESEARCH_STATUSES,
  DOCUMENT_STATUSES
} from '../../../shared/constants'

const COLS = '1fr 12ch 7ch 10ch 7ch 8ch 6ch'

/** Abbreviate a task category for compact display. */
function abbrCategory(category: string): string {
  const map: Record<string, string> = {
    Finance: 'FIN',
    'Voting Record': 'VOT',
    'Personal History': 'PERS',
    Legal: 'LEGAL',
    'Public Statements': 'STMT',
    Associations: 'ASSOC',
    Other: 'OTH'
  }
  return map[category] ?? category
}

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
  const closed = task.status === 'Closed' || task.status === 'Final'
  return !closed && Date.now() - new Date(task.createdAt).getTime() > 7 * 24 * 60 * 60 * 1000
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
  const closed = task.status === 'Closed' || task.status === 'Final'
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
        style={urgent ? { color: '#ef4444' } : undefined}
        title={task.title}
      >
        {task.title}
      </span>
      <span className={styles.cellMeta}>{task.subjectName}</span>
      <span className={styles.cellMeta}>{abbrCategory(task.category)}</span>
      <span className={styles.cellMeta}>{task.status}</span>
      <span className={styles.cellMeta} style={urgent ? { color: '#ef4444' } : undefined}>
        {task.priority}
      </span>
      <span className={styles.cellMeta}>{task.staffName ?? '-'}</span>
      <span className={styles.cellMeta} style={stale ? { color: '#ef4444' } : undefined}>
        {formatAge(task.createdAt)}
      </span>
    </div>
  )
}

interface AddTaskFormProps {
  subjects: SubjectDto[]
  addSubjectId: string
  addTitle: string
  addType: 'Research' | 'Document'
  addCategory: string
  addPriority: string
  onSubjectChange: (v: string) => void
  onTitleChange: (v: string) => void
  onTypeChange: (v: 'Research' | 'Document') => void
  onCategoryChange: (v: string) => void
  onPriorityChange: (v: string) => void
  onSubmit: () => void
  onCancel: () => void
  addTitleRef: React.RefObject<HTMLInputElement | null>
}

/** Inline add-task form rendered above the table when showAdd is true. */
function AddTaskForm({
  subjects,
  addSubjectId,
  addTitle,
  addType,
  addCategory,
  addPriority,
  onSubjectChange,
  onTitleChange,
  onTypeChange,
  onCategoryChange,
  onPriorityChange,
  onSubmit,
  onCancel,
  addTitleRef
}: AddTaskFormProps) {
  return (
    <div className={styles.addRow} style={{ flexWrap: 'wrap', gap: '8px' }}>
      <span className={styles.addLabel}>ADD TASK &gt;</span>
      <select
        className={styles.addSelect}
        value={addSubjectId}
        onChange={e => onSubjectChange(e.currentTarget.value)}
      >
        {subjects.length === 0 && <option value="">-- add a subject first --</option>}
        {subjects.map(s => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <input
        ref={addTitleRef}
        className={styles.addInput}
        placeholder="TASK TITLE"
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
        value={addType}
        onChange={e => onTypeChange(e.currentTarget.value as 'Research' | 'Document')}
      >
        <option value="Research">Research</option>
        <option value="Document">Document</option>
      </select>
      <select
        className={styles.addSelect}
        value={addCategory}
        onChange={e => onCategoryChange(e.currentTarget.value)}
      >
        {TASK_CATEGORIES.map(c => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        className={styles.addSelect}
        value={addPriority}
        onChange={e => onPriorityChange(e.currentTarget.value)}
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
  const [subjects, setSubjects] = useState<SubjectDto[]>([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [showAdd, setShowAdd] = useState(false)
  const [addSubjectId, setAddSubjectId] = useState('')
  const [addTitle, setAddTitle] = useState('')
  const [addType, setAddType] = useState<'Research' | 'Document'>('Research')
  const [addCategory, setAddCategory] = useState(TASK_CATEGORIES[0])
  const [addPriority, setAddPriority] = useState<'Normal'>('Normal')
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const pageRef = useRef<HTMLDivElement>(null)
  const addTitleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    pageRef.current?.focus()
  }, [])
  useEffect(() => {
    apiListSubjects().then(setSubjects)
  }, [])

  useEffect(() => {
    if (subjects.length > 0 && !addSubjectId) setAddSubjectId(subjects[0]!.id)
  }, [subjects, addSubjectId])

  useEffect(() => {
    if (tasks.length > 0) setSelectedIdx(i => Math.min(i, tasks.length - 1))
  }, [tasks.length])

  useEffect(() => {
    if (showAdd) addTitleRef.current?.focus()
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
    if (!addSubjectId) {
      setErrorMsg('Select a subject')
      return
    }
    await createTask({
      subjectId: addSubjectId,
      title: addTitle.trim(),
      taskType: addType,
      category: addCategory,
      status: addType === 'Research' ? 'Backlog' : 'Draft',
      priority: addPriority
    })
    setAddTitle('')
    setShowAdd(false)
    setErrorMsg('')
  }, [addTitle, addSubjectId, addType, addCategory, addPriority, createTask])

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
          {RESEARCH_STATUSES.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
          {DOCUMENT_STATUSES.filter(s => !RESEARCH_STATUSES.includes(s as never)).map(s => (
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
          subjects={subjects}
          addSubjectId={addSubjectId}
          addTitle={addTitle}
          addType={addType}
          addCategory={addCategory}
          addPriority={addPriority}
          onSubjectChange={setAddSubjectId}
          onTitleChange={setAddTitle}
          onTypeChange={setAddType}
          onCategoryChange={v => setAddCategory(v as typeof addCategory)}
          onPriorityChange={v => setAddPriority(v as typeof addPriority)}
          onSubmit={() => void submitAdd()}
          onCancel={cancelAdd}
          addTitleRef={addTitleRef}
        />
      )}

      <div className={styles.tableWrap}>
        <div className={styles.colHeader} style={{ gridTemplateColumns: COLS }}>
          <span>TITLE</span>
          <span>SUBJECT</span>
          <span>CAT</span>
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
