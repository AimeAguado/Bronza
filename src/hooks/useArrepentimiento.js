import { useContext } from 'react'
import { ArrepentimientoContext } from '../context/arrepentimiento-context.js'

export function useArrepentimiento() {
  const ctx = useContext(ArrepentimientoContext)
  if (!ctx) {
    throw new Error('useArrepentimiento must be used within an ArrepentimientoProvider')
  }
  return ctx
}
