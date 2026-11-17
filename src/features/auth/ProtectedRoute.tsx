import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { session, booted } = useAuth()
  const location = useLocation()

  if (!booted) return <p className="fetch-message">Chargement…</p>

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}