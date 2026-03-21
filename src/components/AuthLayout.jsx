import { Link } from 'react-router-dom'
import { Database } from 'lucide-react'

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-background-light pt-20 px-6 pb-12 text-text-main">
      <div className="max-w-md mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-tight text-text-main/70 hover:text-primary transition-colors"
        >
          <Database className="text-primary" size={22} />
          BRONZA CLUB
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
    </div>
  )
}
