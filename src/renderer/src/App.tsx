import React from 'react'
import styles from './App.module.css'
import { TaskListPage } from './pages/TaskListPage'

/** Root application component. */
export default function App(): React.JSX.Element {
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <span className={styles.title}>POLITICKET</span>
        <span className={styles.subtitle}>OPPOSITION RESEARCH PRODUCTION SYSTEM v0.1</span>
      </header>
      <main className={styles.main}>
        <TaskListPage />
      </main>
    </div>
  )
}
