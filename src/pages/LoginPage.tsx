import { Navigate, useLocation } from 'react-router-dom'
import AuthForm from '@/features/auth/AuthForm'
import { useAuth } from '@/features/auth/AuthContext'

function LoginPage() {
  const { session } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/account'

  if (session) return <Navigate to={from} replace />

  return (
    <main className="orders-page">
      <section className="orders-intro">
        <p className="eyebrow"><span className="eyebrow-dot" /> Votre espace</p>
        <h1>Se <em>connecter.</em></h1>
        <p>Retrouvez votre compte et vos commandes.</p>
      </section>
      <AuthForm mode="login" />
    </main>
  )
}

export default LoginPage