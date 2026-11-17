import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

type AuthFormProps = {
  mode: 'login' | 'signup'
}

function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/account'
  const isLogin = mode === 'login'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setErrorMessage(null)
    setInfoMessage(null)

    const credentials = { email, password }
    const { data, error } = isLogin
      ? await supabase.auth.signInWithPassword(credentials)
      : await supabase.auth.signUp(credentials)

    setPending(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }
    if (!data.session) {
      setInfoMessage('Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse.')
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label htmlFor="auth-email">Adresse e-mail</label>
      <input
        id="auth-email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <label htmlFor="auth-password">Mot de passe</label>
      <input
        id="auth-password"
        type="password"
        autoComplete={isLogin ? 'current-password' : 'new-password'}
        minLength={6}
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      {errorMessage && <p className="fetch-message error-message" role="alert">{errorMessage}</p>}
      {infoMessage && <p className="fetch-message" role="status">{infoMessage}</p>}

      <button className="add-button" type="submit" disabled={pending}>
        {pending ? 'Patientez…' : isLogin ? 'Se connecter' : 'Créer mon compte'}
      </button>

      <p className="auth-switch">
        {isLogin ? (
          <>Pas encore de compte ? <Link to="/signup" state={location.state}>Créer un compte</Link></>
        ) : (
          <>Déjà inscrit ? <Link to="/login" state={location.state}>Se connecter</Link></>
        )}
      </p>
    </form>
  )
}

export default AuthForm