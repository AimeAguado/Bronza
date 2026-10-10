import { Schema, model } from 'mongoose'

const cartItemSchema = new Schema(
  {
    productId: String,
    itemId: String,
    name: String,
    price: Number,
    qty: Number,
    image: String,
    color: String,
    size: String,
  },
  { _id: false },
)

const cartSchema = new Schema(
  {
    // Token anónimo del navegador (vive en localStorage, nunca en una URL).
    token: { type: String, required: true, unique: true, index: true },
    // Token de recuperación: solo viaja en el enlace del correo.
    recoveryToken: { type: String, required: true, index: true },
    // Token para darse de baja de los recordatorios.
    unsubscribeToken: { type: String, required: true, index: true },
    email: { type: String, lowercase: true, trim: true, default: '' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    items: [cartItemSchema],
    total: { type: Number, default: 0 },
    itemCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'completed', 'recovered', 'abandoned'],
      default: 'active',
    },
    lastActivityAt: { type: Date, default: Date.now },
    reminderSentAt: { type: Date, default: null },
    reminderCount: { type: Number, default: 0 },
    recoveredAt: { type: Date, default: null },
    unsubscribed: { type: Boolean, default: false },
  },
  { timestamps: true },
)

cartSchema.index({ status: 1, reminderSentAt: 1, lastActivityAt: 1 })

export const Cart = model('Cart', cartSchema)
