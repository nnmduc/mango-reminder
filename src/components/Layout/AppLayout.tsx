/* AppLayout component - Main fullscreen wrapper for the app */
import { ReactNode } from 'react'
import styles from './AppLayout.module.css'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={styles.container}>
      {children}
    </div>
  )
}
