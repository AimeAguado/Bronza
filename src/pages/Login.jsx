import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import AuthLayout from '../components/AuthLayout.jsx'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  const { user, login, logout } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    return (
      <AuthLayout
        title="Tu cuenta"
        subtitle="Ya iniciaste sesión en este dispositivo."
      >
        <p className="text-sm">
          Hola, <span className="font-bold">{user.name}</span> ({user.email})
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full rounded-xl bg-text-main py-3.5 text-xs font-bold uppercase tracking-widest text-background-light transition-colors hover:bg-primary"
          >
            Volver a la tienda
          </button>
          <button
            type="button"
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="w-full rounded-xl border-2 border-text-main/20 py-3.5 text-xs font-bold uppercase tracking-widest text-text-main transition-colors hover:border-primary hover:text-primary"
          >
            Cerrar sesión
          </button>
        </div>
      </AuthLayout>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.ok) {
      navigate(from, { replace: true })
      return
    }
    setError(result.error || 'Error al iniciar sesión.')
  }

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Ingresá con tu cuenta de Bronza Club."
    >
      {location.state?.from?.pathname === '/checkout' ? (
        <p className="mb-5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-text-main">
          Iniciá sesión para continuar con el pago de tu pedido.
        </p>
      ) : null}
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <p
            className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-text-main"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div>
          <label
            htmlFor="login-email"
            className="block text-[10px] font-bold uppercase tracking-widest text-text-main/60"
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-accent-muted/60 bg-background-light px-4 py-3 text-sm text-text-main outline-none ring-primary/30 transition-shadow focus:border-primary focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="block text-[10px] font-bold uppercase tracking-widest text-text-main/60"
          >
            Contraseña
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-accent-muted/60 bg-background-light px-4 py-3 text-sm text-text-main outline-none ring-primary/30 transition-shadow focus:border-primary focus:ring-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-text-main py-3.5 text-xs font-bold uppercase tracking-widest text-background-light transition-colors hover:bg-primary disabled:opacity-60"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-main/60">
        ¿No tenés cuenta?{' '}
        <Link
          to="/register"
          state={location.state}
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Registrate
        </Link>
      </p>
    </AuthLayout>
  )
}
