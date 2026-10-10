import { useCallback, useMemo, useState } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { ArrepentimientoContext } from './arrepentimiento-context.js'
import ArrepentimientoContent from '../components/ArrepentimientoContent.jsx'

export function ArrepentimientoProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [order, setOrder] = useState(null)

  const open = useCallback((targetOrder = null) => {
    setOrder(targetOrder)
    setIsOpen(true)
  }, [])
  const close = useCallback(() => {
    setIsOpen(false)
    setOrder(null)
  }, [])

  const value = useMemo(
    () => ({ isOpen, order, open, close }),
    [isOpen, order, open, close],
  )

  return (
    <ArrepentimientoContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <>
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
            />
            <Motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed inset-x-0 top-1/2 mx-3 z-[70] max-w-lg -translate-y-1/2 md:mx-auto"
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Botón de arrepentimiento"
                className="relative overflow-hidden rounded-3xl bg-background-light shadow-2xl"
              >
                <button
                  type="button"
                  onClick={close}
                  className="absolute top-3 right-3 z-10 rounded-full bg-background-light/80 p-2 text-text-main/60 transition-colors hover:text-primary"
                  aria-label="Cerrar arrepentimiento"
                >
                  <X size={20} />
                </button>
                <div className="max-h-[90vh] overflow-y-auto">
                  <ArrepentimientoContent order={order} />
                </div>
              </div>
            </Motion.div>
          </>
        )}
      </AnimatePresence>
    </ArrepentimientoContext.Provider>
  )
}