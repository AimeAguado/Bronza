import { Schema, model } from 'mongoose'

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        id: String,
        productId: String,
        title: String,
        quantity: Number,
        unit_price: Number,
        image: String,
        color: String,
        size: String,
      },
    ],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        'pending',
        'waiting_payment',
        'approved',
        'shipped',
        'delivered',
        'rejected',
        'cancelled',
      ],
      default: 'pending',
    },
    externalReference: { type: String, index: true },
    cartToken: { type: String, index: true },
    number: { type: String, index: true },
    paymentMethod: {
      type: String,
      enum: ['mercadopago', 'transfer'],
      default: 'mercadopago',
    },
    delivery: { type: String, default: 'A coordinar' },
    // Evita descontar el stock dos veces si el pedido vuelve a "approved".
    stockAdjusted: { type: Boolean, default: false },
    preferenceId: String,
    paymentId: String,
  },
  { timestamps: true },
)

export const Order = model('Order', orderSchema)
