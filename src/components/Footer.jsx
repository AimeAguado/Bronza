import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const FOOTER_LINKS = [
  { to: '/', label: 'Shop the Drop' },
  { to: '/orders', label: 'Mis pedidos' },
  { to: '/login', label: 'Iniciar sesión' },
  { to: '/register', label: 'Crear cuenta' },
];

function Footer() {
  return (
    <footer className="bg-primary text-background-light mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-3">
        <div>
          <div className="flex items-center mb-4">
            <img src="/logo-wordmark.svg" alt="Bronza Club" className="h-8" />
          </div>
          <p className="text-background-light/60 text-sm leading-relaxed max-w-xs">
            Bikinis para vivir el verano a tu manera.
          </p>
        </div>

        <nav aria-label="Enlaces del pie de página" className="flex flex-col gap-3 text-[11px] font-bold uppercase tracking-[0.25em]">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="text-background-light/70 hover:text-accent transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-accent mb-4">Contacto</h2>
          <a
            href="https://wa.me/5491100000000?text=Hola!%20Quiero%20hacer%20una%20consulta"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-background-light/70 hover:text-accent transition-colors"
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-accent-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row gap-2 justify-between text-[10px] uppercase tracking-widest text-background-light/50">
          <span>© {new Date().getFullYear()} Bronza Club. Todos los derechos reservados.</span>
          <span className="text-accent">Hecho con calma, cerca del mar</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
