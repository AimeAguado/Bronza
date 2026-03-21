import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import AuthLayout from '../components/AuthLayout.jsx'

export default function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  const { user, register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    return (
      <AuthLayout title="Registro" subtitle="Ya tenés una sesión activa.">
        <p className="text-sm text-text-main/70">
          Cerrá sesión desde la página de cuenta o volvé a la tienda.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-text-main py-3.5 text-xs font-bold uppercase tracking-widest text-background-light transition-colors hover:bg-primary"
        >
          Volver a la tienda
        </Link>
      </AuthLayout>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setLoading(true)
    const result = await register(name, email, password)
    setLoading(false)
    if (result.ok) {
      navigate(from, { replace: true })
      return
    }
    setError(result.error || 'Error al registrarse.')
  }

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Completá tus datos para registrarte en Bronza Club."
    >
      {location.state?.from?.pathname === '/checkout' ? (
        <p className="mb-5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-text-main">
          Creá tu cuenta para poder finalizar el pago de tu pedido.
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
            htmlFor="register-name"
            className="block text-[10px] font-bold uppercase tracking-widest text-text-main/60"
          >
            Nombre
          </label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-accent-muted/60 bg-background-light px-4 py-3 text-sm text-text-main outline-none ring-primary/30 transition-shadow focus:border-primary focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="register-email"
            className="block text-[10px] font-bold uppercase tracking-widest text-text-main/60"
          >
            Email
          </label>
          <input
            id="register-email"
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
            htmlFor="register-password"
            className="block text-[10px] font-bold uppercase tracking-widest text-text-main/60"
          >
            Contraseña
          </label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-accent-muted/60 bg-background-light px-4 py-3 text-sm text-text-main outline-none ring-primary/30 transition-shadow focus:border-primary focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="register-confirm"
            className="block text-[10px] font-bold uppercase tracking-widest text-text-main/60"
          >
            Repetir contraseña
          </label>
          <input
            id="register-confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-accent-muted/60 bg-background-light px-4 py-3 text-sm text-text-main outline-none ring-primary/30 transition-shadow focus:border-primary focus:ring-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-text-main py-3.5 text-xs font-bold uppercase tracking-widest text-background-light transition-colors hover:bg-primary disabled:opacity-60"
        >
          {loading ? 'Creando cuenta…' : 'Registrarme'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-main/60">
        ¿Ya tenés cuenta?{' '}
        <Link
          to="/login"
          state={location.state}
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Iniciá sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
