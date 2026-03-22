import { Schema, model } from 'mongoose'

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    color: { type: String, trim: true },
    price: { type: Number, required: true },
    image: { type: String, trim: true },
    volume: { type: String, trim: true },
    stock: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export const Product = model('Product', productSchema)
