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
      },
    ],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    externalReference: { type: String, index: true },
    preferenceId: String,
    paymentId: String,
  },
  { timestamps: true },
)

export const Order = model('Order', orderSchema)
