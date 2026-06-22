import React from 'react'
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom'
import styles from './App.module.css'
import { NavBar } from './components/NavBar'
import { HomePage } from './pages/HomePage'
import { ProjectsPage } from './pages/ProjectsPage'
import { StaffPage } from './pages/StaffPage'
import { TaskListPage } from './pages/TaskListPage'

/** Root application component. */
export default function App(): React.JSX.Element {
  return (
    <MemoryRouter initialEntries={['/']}>
      <div className={styles.screen}>
        <header className={styles.header}>
          <span className={styles.title}>POLITICKET</span>
          <span className={styles.subtitle}>OPPOSITION RESEARCH PRODUCTION TRACKER v0.1</span>
        </header>
        <NavBar />
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/tasks" element={<TaskListPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </MemoryRouter>
  )
}
