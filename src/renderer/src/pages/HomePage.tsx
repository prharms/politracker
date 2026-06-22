import React, { useState, useEffect } from 'react'
import styles from './HomePage.module.css'
import { useTasks } from '../../hooks/use-tasks'
import { useStaff } from '../../hooks/use-staff'
import { useProjects } from '../../hooks/use-projects'
import { apiListSubprojects } from '../../api/subprojects-api'
import { formatDue, isOverdue } from '../../../shared/utils/days-until'
import type { TaskDto } from '../../../shared/dtos/task-dto'
import type { StaffDto } from '../../../shared/dtos/staff-dto'
import type { ProjectDto } from '../../../shared/dtos/project-dto'
import type { SubprojectDto } from '../../../shared/dtos/subproject-dto'

// ── Module-level helpers ─────────────────────────────────────────────────────

/** Return open (non-complete) tasks sorted soonest due first. */
function openTasks(tasks: TaskDto[]): TaskDto[] {
  return tasks
    .filter(t => t.status !== 'Complete')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

/** Return open tasks assigned to a specific staff member. */
function staffOpenTasks(staffId: string, tasks: TaskDto[]): TaskDto[] {
  return tasks.filter(t => t.staffId === staffId && t.status !== 'Complete')
}

/** Return the soonest due date among a task list, or null if empty. */
function soonestTaskDue(tasks: TaskDto[]): string | null {
  if (tasks.length === 0) return null
  return tasks.reduce((acc, t) => (t.dueDate < acc ? t.dueDate : acc), tasks[0]!.dueDate)
}

/** Return the count of overdue tasks in a list. */
function countOverdue(tasks: TaskDto[]): number {
  return tasks.filter(t => isOverdue(t.dueDate)).length
}

/** Return all non-default subprojects (name !== "None") for a project. */
function namedSubprojects(projectId: string, subs: SubprojectDto[]): SubprojectDto[] {
  return subs.filter(s => s.projectId === projectId && s.name !== 'None')
}

/** Abbreviate a project type for compact display. */
function shortType(type: string): string {
  if (type === 'Candidate Campaign') return 'CANDIDATE'
  if (type === 'Ballot Measure') return 'BALLOT'
  if (type === 'Legislative Advocacy') return 'ADVOCACY'
  return 'BACKGROUND'
}

/** Return the project label including subproject name if relevant. */
function taskProjectLabel(task: TaskDto): string {
  if (task.subprojectName && task.subprojectName !== 'None') {
    return `${task.projectName}/${task.subprojectName}`
  }
  return task.projectName
}

// ── Data hook ────────────────────────────────────────────────────────────────

/** Load all data needed by the dashboard in parallel. */
function useDashboardData() {
  const { tasks, loading: tasksLoading } = useTasks({})
  const { staff, loading: staffLoading } = useStaff()
  const { projects, loading: projectsLoading } = useProjects()
  const [allSubprojects, setAllSubprojects] = useState<SubprojectDto[]>([])

  useEffect(() => {
    void apiListSubprojects().then(setAllSubprojects)
  }, [])

  const loading = tasksLoading || staffLoading || projectsLoading
  return { tasks, staff, projects, allSubprojects, loading }
}

// ── Staff workload panel ─────────────────────────────────────────────────────

interface StaffRowProps {
  member: StaffDto
  tasks: TaskDto[]
}

/** One row in the staff workload table. */
function StaffRow({ member, tasks }: StaffRowProps) {
  const mine = staffOpenTasks(member.id, tasks)
  const over = countOverdue(mine)
  const next = soonestTaskDue(mine)
  return (
    <tr>
      <td>
        <span className={styles.initialsAccent}>{member.initials}</span>
        {member.name}
      </td>
      <td className={styles.numCell}>{mine.length}</td>
      <td className={styles.numCell} style={over > 0 ? { color: '#ff3333' } : undefined}>
        {over > 0 ? over : '-'}
      </td>
      <td
        className={styles.dueCol}
        style={next && isOverdue(next) ? { color: '#ff3333' } : undefined}
      >
        {next ? formatDue(next) : '-'}
      </td>
    </tr>
  )
}

/** Panel showing open task counts and earliest due date per active staff member. */
function StaffWorkloadPanel({ staff, tasks }: { staff: StaffDto[]; tasks: TaskDto[] }) {
  const active = staff.filter(s => s.status === 'Active')
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>STAFF WORKLOAD</div>
      <div className={styles.panelBody}>
        {active.length === 0 && <div className={styles.empty}>NO ACTIVE STAFF</div>}
        <table className={styles.panelTable}>
          <thead>
            <tr>
              <th>STAFF</th>
              <th className={styles.numHead}>OPEN</th>
              <th className={styles.numHead}>LATE</th>
              <th className={styles.dueCol}>NEXT DUE</th>
            </tr>
          </thead>
          <tbody>
            {active.map(s => (
              <StaffRow key={s.id} member={s} tasks={tasks} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Active projects panel ────────────────────────────────────────────────────

interface ProjectRowProps {
  proj: ProjectDto
  subprojects: SubprojectDto[]
}

/** Project row plus indented rows for any named subprojects. */
function ProjectRow({ proj, subprojects }: ProjectRowProps) {
  const subs = namedSubprojects(proj.id, subprojects)
  const over = isOverdue(proj.dueDate)
  return (
    <>
      <tr>
        <td>{proj.name}</td>
        <td className={styles.typeCol}>{shortType(proj.type)}</td>
        <td className={styles.dueCol} style={over ? { color: '#ff3333' } : undefined}>
          {formatDue(proj.dueDate)}
        </td>
      </tr>
      {subs.map(sub => {
        const subDue = sub.dueDate ?? proj.dueDate
        const subOver = isOverdue(subDue)
        return (
          <tr key={sub.id} className={styles.subRow}>
            <td className={styles.subIndent}>{sub.name}</td>
            <td></td>
            <td className={styles.dueCol} style={subOver ? { color: '#ff3333' } : undefined}>
              {formatDue(subDue)}
            </td>
          </tr>
        )
      })}
    </>
  )
}

/** Panel showing active projects sorted soonest due first, with their subprojects. */
function ProjectsPanel({
  projects,
  subprojects
}: {
  projects: ProjectDto[]
  subprojects: SubprojectDto[]
}) {
  const active = [...projects]
    .filter(p => p.status === 'Active')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>ACTIVE PROJECTS</div>
      <div className={styles.panelBody}>
        {active.length === 0 && <div className={styles.empty}>NO ACTIVE PROJECTS</div>}
        <table className={styles.panelTable}>
          <thead>
            <tr>
              <th>PROJECT</th>
              <th className={styles.typeCol}>TYPE</th>
              <th className={styles.dueCol}>DUE</th>
            </tr>
          </thead>
          <tbody>
            {active.map(proj => (
              <ProjectRow key={proj.id} proj={proj} subprojects={subprojects} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Open tasks panel ─────────────────────────────────────────────────────────

/** One row in the open tasks table. */
function OpenTaskRow({ task }: { task: TaskDto }) {
  const over = isOverdue(task.dueDate)
  const urgent = task.priority === 'Urgent'
  return (
    <tr>
      <td style={urgent ? { color: '#ff3333' } : undefined}>{task.title}</td>
      <td className={styles.projCol}>{taskProjectLabel(task)}</td>
      <td className={styles.staffCol}>{task.staffName ?? '-'}</td>
      <td className={styles.dueCol} style={over ? { color: '#ff3333' } : undefined}>
        {formatDue(task.dueDate)}
      </td>
      <td className={styles.statusCol}>{task.status}</td>
      <td className={styles.priCol} style={urgent ? { color: '#ff3333' } : undefined}>
        {task.priority}
      </td>
    </tr>
  )
}

/** Full-height panel listing all open tasks sorted soonest due first. */
function OpenTasksPanel({ tasks, loading }: { tasks: TaskDto[]; loading: boolean }) {
  const open = openTasks(tasks)
  return (
    <div className={styles.bottomPanel}>
      <div className={styles.panelHeader}>
        OPEN TASKS <span className={styles.count}>({open.length})</span>
      </div>
      <div className={styles.panelBody}>
        {loading && <div className={styles.loading}>LOADING...</div>}
        {!loading && open.length === 0 && <div className={styles.empty}>NO OPEN TASKS</div>}
        <table className={styles.panelTable}>
          <thead>
            <tr>
              <th>TITLE</th>
              <th className={styles.projCol}>PROJECT</th>
              <th className={styles.staffCol}>STAFF</th>
              <th className={styles.dueCol}>DUE</th>
              <th className={styles.statusCol}>STATUS</th>
              <th className={styles.priCol}>PRI</th>
            </tr>
          </thead>
          <tbody>
            {open.map(task => (
              <OpenTaskRow key={task.id} task={task} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

/** Dashboard overview - production summary across active projects and staff. */
export function HomePage(): React.JSX.Element {
  const { tasks, staff, projects, allSubprojects, loading } = useDashboardData()
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.title}>DASHBOARD</span>
      </div>
      <div className={styles.topGrid}>
        <StaffWorkloadPanel staff={staff} tasks={tasks} />
        <ProjectsPanel projects={projects} subprojects={allSubprojects} />
      </div>
      <OpenTasksPanel tasks={tasks} loading={loading} />
    </div>
  )
}
