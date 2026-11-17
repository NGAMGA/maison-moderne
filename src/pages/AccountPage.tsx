import { useAuth } from '@/features/auth/AuthContext'

function AccountPage() {
  const { session } = useAuth()

  return (
    <main className="orders-page">
      <section className="orders-intro">
        <p className="eyebrow"><span className="eyebrow-dot" /> Votre espace</p>
        <h1>Mon <em>compte.</em></h1>
        <p>Bonjour {session?.user.email}</p>
      </section>
    </main>
  )
}

export default AccountPage