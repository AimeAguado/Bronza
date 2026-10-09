import { useState } from 'react'
import { motion as Motion } from 'framer-motion'
import { CreditCard, Truck, RefreshCw, Lock, Check, MessageCircle } from 'lucide-react'

const HERO_IMAGE =
  'https://images.pexels.com/photos/8651336/pexels-photo-8651336.jpeg?auto=compress&cs=tinysrgb&w=1200'

export const WHATSAPP_URL =
  'https://wa.me/5491100000000?text=' +
  encodeURIComponent('Hola! Quiero hacer una consulta sobre mi compra en Bronza')

export const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

const CARDS = [
  {
    icon: CreditCard,
    title: 'Medios de pago',
    text: 'Elegí el medio de pago que mejor se adapte a vos.',
    items: ['Transferencia bancaria', 'Mercado Pago'],
  },
  {
    icon: Truck,
    title: 'Envíos',
    text: 'Queremos que tu Bronza llegue a vos de la forma más cómoda posible.',
    items: [
      'Coordinamos la entrega de tu pedido para que puedas disfrutar de tu nueva bikini.',
    ],
  },
  {
    icon: RefreshCw,
    title: 'Cambios y devoluciones',
    paragraphs: [
      'Por razones de higiene y seguridad, las bikinis compradas online no tienen cambio ni devolución por talle o modelo, ya que no es posible verificar las condiciones de la prenda durante la prueba.',
      'En Bronza priorizamos el cuidado y el bienestar de todas nuestras clientas. Te recomendamos revisar la guía de talles y las descripciones de cada producto antes de realizar tu compra.',
      'Gracias por comprender y acompañar a Bronza. ✨',
    ],
  },
  {
    icon: Lock,
    title: 'Compra segura',
    text: 'Estamos para acompañarte antes y después de tu compra.',
    items: [
      'Si tenés dudas sobre un modelo, los talles, los pagos o tu pedido, estamos para ayudarte.',
    ],
  },
]

export default function CompraTranquilaContent({ variant = 'page' }) {
  const modal = variant === 'modal'
  const [heroBroken, setHeroBroken] = useState(false)
  const Title = modal ? 'h2' : 'h1'

  return (
    <>
      {/* PORTADA */}
      <section
        className={
          modal
            ? 'px-6 pt-10 pb-8 md:px-10'
            : 'mx-auto grid max-w-7xl gap-12 px-6 pt-16 pb-20 md:grid-cols-2 md:items-center md:pt-24 md:pb-28'
        }
      >
        <Motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-accent-muted">
            COMPRA TRANQUILA
          </p>
          <Title
            className={`mt-5 font-black uppercase tracking-tighter leading-[1.05] ${
              modal ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl lg:text-6xl'
            }`}
          >
            Todo lo que necesitás saber para disfrutar tu bikini{' '}
            <span className="font-serif italic normal-case tracking-normal text-accent">
              sin preocupaciones
            </span>
            .
          </Title>
          <p
            className={`mt-6 leading-relaxed text-text-main/70 ${
              modal ? 'text-sm md:text-base' : 'max-w-xl text-base md:text-lg'
            }`}
          >
            Queremos que tu experiencia de compra sea tan linda como el verano.
            Acá te contamos todo sobre medios de pago, envíos y cambios.
          </p>
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-accent-muted">
            Tu bikini, más cerca ♡
          </p>
        </Motion.div>

        {!modal && (
          <Motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-accent-muted/25 shadow-sm">
              {!heroBroken ? (
                <img
                  src={HERO_IMAGE}
                  alt="Mujer con bikini disfrutando de un día de playa en verano"
                  loading="lazy"
                  onError={() => setHeroBroken(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  role="img"
                  aria-label="Atardecer cálido en la playa"
                  className="h-full w-full bg-gradient-to-br from-accent/40 via-accent-muted/40 to-primary/70"
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/45 via-transparent to-transparent" />
            </div>
          </Motion.div>
        )}
      </section>

      {/* TARJETAS INFORMATIVAS */}
      <section
        aria-label="Información de compra"
        className={modal ? 'px-6 pb-8 md:px-10' : 'mx-auto max-w-6xl px-6 pb-20 md:pb-28'}
      >
        <div className="grid gap-6 md:grid-cols-2">
          {CARDS.map((card, i) => {
            const Icon = card.icon
            return (
              <Motion.article
                key={card.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
                className="flex flex-col rounded-3xl border border-accent-muted/30 bg-white/60 p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md md:p-8"
              >
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-primary">
                  <Icon size={26} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-xl font-black uppercase tracking-tighter md:text-2xl">
                  {card.title}
                </h3>
                {card.paragraphs ? (
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-text-main/75">
                    {card.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="mt-3 leading-relaxed text-text-main/75">{card.text}</p>
                    <ul className="mt-5 space-y-3">
                      {card.items.map((item) => (
                        <li
                          key={item}
                          className="flex gap-3 text-sm leading-relaxed text-text-main/80"
                        >
                          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                            <Check size={12} strokeWidth={3} aria-hidden="true" />
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </Motion.article>
            )
          })}
        </div>
      </section>

      {/* TENÉS DUDAS */}
      <section
        className={modal ? 'px-6 pb-8 md:px-10' : 'mx-auto max-w-6xl px-6 pb-20 md:pb-28'}
      >
        <Motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-accent/30 bg-accent/15 p-8 text-center md:p-12"
        >
          <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
            <MessageCircle size={26} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <h3 className="mt-6 text-2xl font-black uppercase tracking-tighter md:text-3xl">
            ¿Tenés dudas?
          </h3>
          <p className="mx-auto mt-3 max-w-xl leading-relaxed text-text-main/75">
            Escribinos por WhatsApp y te ayudamos a encontrar tu Bronza ideal.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-8 inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-background-light transition-colors hover:bg-accent hover:text-primary ${FOCUS}`}
          >
            Escribinos por WhatsApp
          </a>
        </Motion.div>
      </section>

      {/* BANNER FINAL */}
      <section
        aria-label="Cierre"
        className="relative overflow-hidden bg-gradient-to-r from-accent/30 via-background-light to-accent-muted/40"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(circle at 12% 20%, rgba(41,30,8,0.12) 0, transparent 38%), radial-gradient(circle at 85% 80%, rgba(222,139,189,0.35) 0, transparent 42%)',
          }}
        />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-14 text-center md:py-20">
          <div>
            <p className="mx-auto max-w-2xl text-lg font-bold leading-snug md:text-3xl">
              En Bronza, queremos que te sientas linda, cómoda y segura en cada paso.
            </p>
            <p className="mt-5 text-xl font-black uppercase tracking-[0.15em] md:text-4xl">
              Tu verano, sin complicaciones.
            </p>
          </div>
          <p className="font-serif text-3xl italic text-primary/80 md:text-4xl">
            Gracias por elegirnos ♡
          </p>
        </div>
      </section>
    </>
  )
}
