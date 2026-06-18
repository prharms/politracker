import React from 'react'
import styles from './TaskRow.module.css'
import type { TaskDto } from '../../../shared/dtos/task-dto'

interface TaskRowProps {
  task: TaskDto
}

/** Format elapsed time since a given ISO timestamp as a compact string. */
function formatAge(isoString: string): string {
  const ms = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(ms / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d`
  if (hours > 0) return `${hours}h`
  return `${minutes}m`
}

/** Return true if the task has been open for more than 7 days. */
function isStale(isoString: string): boolean {
  return Date.now() - new Date(isoString).getTime() > 7 * 24 * 60 * 60 * 1000
}

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

/** Abbreviate a priority label. */
function abbrPriority(priority: string): string {
  const map: Record<string, string> = {
    Low: 'LOW',
    Normal: 'NORM',
    High: 'HIGH',
    Urgent: 'URGNT'
  }
  return map[priority] ?? priority
}

/** A single task row in the task list table. */
export function TaskRow({ task }: TaskRowProps): React.JSX.Element {
  const closed = task.status === 'Closed' || task.status === 'Final'
  const urgent = task.priority === 'Urgent' && !closed
  const stale = !closed && isStale(task.createdAt)

  const rowClass = [styles.row, urgent ? styles.urgent : '', closed ? styles.closed : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rowClass}>
      <span className={styles.title} title={task.title}>
        {task.title}
      </span>
      <span className={styles.subject} title={task.subjectName}>
        {task.subjectName}
      </span>
      <span className={styles.category}>{abbrCategory(task.category)}</span>
      <span className={styles.type}>{task.taskType.toUpperCase()}</span>
      <span className={styles.status}>{task.status.toUpperCase()}</span>
      <span className={styles.priority}>{abbrPriority(task.priority)}</span>
      <span className={styles.staff} title={task.staffName ?? ''}>
        {task.staffName ?? '-'}
      </span>
      <span className={[styles.age, stale ? styles.stale : ''].filter(Boolean).join(' ')}>
        {formatAge(task.createdAt)}
      </span>
    </div>
  )
}

/** Column header row for the task list table. */
export function TaskRowHeader(): React.JSX.Element {
  return (
    <div className={styles.header}>
      <span>TITLE</span>
      <span>SUBJECT</span>
      <span>CATEGORY</span>
      <span>TYPE</span>
      <span>STATUS</span>
      <span>PRIORITY</span>
      <span>STAFF</span>
      <span>AGE</span>
    </div>
  )
}
