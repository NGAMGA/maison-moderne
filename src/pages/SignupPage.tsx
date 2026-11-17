import { Navigate } from 'react-router-dom'
import AuthForm from '@/features/auth/AuthForm'
import { useAuth } from '@/features/auth/AuthContext'

function SignupPage() {
  const { session } = useAuth()

  if (session) return <Navigate to="/account" replace />

  return (
    <main className="orders-page">
      <section className="orders-intro">
        <p className="eyebrow"><span className="eyebrow-dot" /> Votre espace</p>
        <h1>Créer un <em>compte.</em></h1>
        <p>Quelques secondes suffisent pour commander.</p>
      </section>
      <AuthForm mode="signup" />
    </main>
  )
}

export default SignupPage