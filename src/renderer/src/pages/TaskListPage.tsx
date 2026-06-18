import React, { useState } from 'react'
import styles from './TaskListPage.module.css'
import { FilterBar } from '../components/FilterBar'
import { TaskRow, TaskRowHeader } from '../components/TaskRow'
import { useTasks } from '../../hooks/use-tasks'
import { useFilterOptions } from '../../hooks/use-filter-options'
import type { TaskListFilters } from '../../../shared/dtos/task-dto'

/** Main task list page - the application home screen. */
export function TaskListPage(): React.JSX.Element {
  const [filters, setFilters] = useState<TaskListFilters>({})
  const { tasks, loading } = useTasks(filters)
  const { staff, projects, loading: optionsLoading } = useFilterOptions()

  return (
    <div className={styles.page}>
      <FilterBar
        staff={staff}
        projects={projects}
        filters={filters}
        taskCount={tasks.length}
        onFilterChange={setFilters}
      />
      <TaskRowHeader />
      <div className={styles.tableContainer}>
        {loading || optionsLoading ? (
          <div className={styles.loading}>LOADING...</div>
        ) : tasks.length === 0 ? (
          <div className={styles.empty}>NO TASKS FOUND_</div>
        ) : (
          tasks.map(task => <TaskRow key={task.id} task={task} />)
        )}
      </div>
    </div>
  )
}
