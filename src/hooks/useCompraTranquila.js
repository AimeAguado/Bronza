import { useContext } from 'react'
import { CompraTranquilaContext } from '../context/compra-tranquila-context.js'

export function useCompraTranquila() {
  const ctx = useContext(CompraTranquilaContext)
  if (!ctx) {
    throw new Error('useCompraTranquila must be used within a CompraTranquilaProvider')
  }
  return ctx
}
