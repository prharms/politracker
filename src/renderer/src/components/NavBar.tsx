import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './NavBar.module.css'

const ROUTES = [
  { key: '1', label: 'HOME', path: '/' },
  { key: '2', label: 'STAFF', path: '/staff' },
  { key: '3', label: 'CLIENTS', path: '/clients' },
  { key: '4', label: 'PROJECTS', path: '/projects' },
  { key: '5', label: 'TASKS', path: '/tasks' }
]

/** Top navigation bar with number-key shortcuts. */
export function NavBar(): React.JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleKey = (e: KeyboardEvent): void => {
      const target = e.target as Element | null
      if (target?.tagName === 'INPUT' || target?.tagName === 'SELECT') {
        return
      }
      const route = ROUTES.find(r => r.key === e.key)
      if (route) {
        navigate(route.path)
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [navigate])

  return (
    <nav className={styles.nav}>
      {ROUTES.map(route => {
        const active = location.pathname === route.path
        return (
          <button
            key={route.key}
            className={active ? `${styles.item} ${styles.active}` : styles.item}
            onClick={() => navigate(route.path)}
            tabIndex={-1}
          >
            <span className={styles.key}>[{route.key}]</span>
            <span className={styles.label}>{route.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
