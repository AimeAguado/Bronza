import { Schema, model } from 'mongoose'

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        id: String,
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
    preferenceId: String,
    paymentId: String,
  },
  { timestamps: true },
)

export const Order = model('Order', orderSchema)
