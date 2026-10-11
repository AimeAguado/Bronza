import { Schema, model } from 'mongoose'

const pendingItemSchema = new Schema(
  {
    id: String,
    title: String,
    quantity: Number,
    unit_price: Number,
    image: String,
    color: String,
    size: String,
  },
  { _id: false },
)

const pendingCheckoutSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [pendingItemSchema],
    total: { type: Number, required: true },
    externalReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    cartToken: { type: String, index: true },
    preferenceId: String,
  },
  { timestamps: true },
)

// El borrador se descarta solo si el pago nunca se completa (24 h).
pendingCheckoutSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 })

export const PendingCheckout = model('PendingCheckout', pendingCheckoutSchema)
