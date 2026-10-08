import { Link } from 'react-router-dom'
import Footer from './Footer.jsx'

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-background-light pt-10 px-6 pb-10 text-text-main flex flex-col">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center pt-8 pb-16">
        <Link
          to="/"
          aria-label="Volver al inicio"
          className="inline-flex items-center text-text-main/70 hover:text-primary transition-colors"
        >
          <img src="/logo-wordmark.svg" alt="Bronza Club" className="h-6" />
        </Link>

        <div className="mt-10 rounded-2xl border border-accent-muted/50 bg-white/50 p-8 shadow-sm backdrop-blur-sm">
          <h1 className="text-2xl font-black uppercase tracking-tighter">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-text-main/60">{subtitle}</p>
          ) : null}
          <div className="mt-8">{children}</div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
