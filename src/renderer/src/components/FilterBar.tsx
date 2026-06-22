import React from 'react'
import styles from './FilterBar.module.css'
import { TASK_STATUSES } from '../../../shared/constants'
import type { StaffDto } from '../../../shared/dtos/staff-dto'
import type { ProjectDto } from '../../../shared/dtos/project-dto'
import type { TaskListFilters } from '../../../shared/dtos/task-dto'

interface FilterBarProps {
  staff: StaffDto[]
  projects: ProjectDto[]
  filters: TaskListFilters
  taskCount: number
  onFilterChange: (filters: TaskListFilters) => void
}

/** Filter bar for the task list: staff, project, and status selectors. */
export function FilterBar({
  staff,
  projects,
  filters,
  taskCount,
  onFilterChange
}: FilterBarProps): React.JSX.Element {
  /** Handle a change to a single filter field. */
  function handleChange(key: keyof TaskListFilters, value: string): void {
    onFilterChange({ ...filters, [key]: value || undefined })
  }

  return (
    <div className={styles.bar}>
      <div className={styles.group}>
        <span className={styles.label}>STAFF:</span>
        <select
          className={styles.select}
          value={filters.staffId ?? ''}
          onChange={e => handleChange('staffId', e.target.value)}
        >
          <option value="">ALL</option>
          {staff.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <span className={styles.label}>PROJECT:</span>
        <select
          className={styles.select}
          value={filters.projectId ?? ''}
          onChange={e => handleChange('projectId', e.target.value)}
        >
          <option value="">ALL</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <span className={styles.label}>STATUS:</span>
        <select
          className={styles.select}
          value={filters.status ?? ''}
          onChange={e => handleChange('status', e.target.value)}
        >
          <option value="">ALL</option>
          {TASK_STATUSES.map(s => (
            <option key={s} value={s}>
              {s.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <span className={styles.count}>{taskCount} TASKS</span>
    </div>
  )
}
