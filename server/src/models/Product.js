import { Schema, model } from 'mongoose'

const variantSchema = new Schema({
  color: { type: String, required: true, trim: true },
  images: [{ type: String, trim: true }],
  stock: { type: Map, of: Number, default: {} },
}, { _id: false })

const productSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  category: { type: String, trim: true },
  price: { type: Number, required: true },
  sizes: [{ type: String, trim: true }],
  variants: [variantSchema],
  active: { type: Boolean, default: true },
}, { timestamps: true })

export const Product = model('Product', productSchema)
