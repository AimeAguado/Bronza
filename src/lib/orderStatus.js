export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'waiting_payment', label: 'Esperando pago' },
  { value: 'approved', label: 'Pago realizado' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'rejected', label: 'Pago rechazado' },
  { value: 'cancelled', label: 'Cancelado' },
]

export const STATUS_LABELS = Object.fromEntries(
  ORDER_STATUSES.map((s) => [s.value, s.label]),
)

export const STATUS_STYLES = {
  pending: 'bg-accent text-primary',
  waiting_payment: 'bg-accent/50 text-primary',
  approved: 'bg-primary text-background-light',
  shipped: 'bg-primary/75 text-background-light',
  delivered: 'bg-accent-muted text-primary',
  rejected: 'bg-accent-muted/50 text-primary',
  cancelled: 'bg-accent-muted/50 text-primary line-through',
}
