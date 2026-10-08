export function variantStock(variant, size) {
  return Number(variant?.stock?.[size]) || 0
}

export function productStock(product) {
  let total = 0
  for (const variant of product?.variants ?? []) {
    for (const qty of Object.values(variant.stock ?? {})) {
      total += Number(qty) || 0
    }
  }
  return total
}

export function hasStock(product) {
  return productStock(product) > 0
}

export function firstAvailableSize(product, variantIndex = 0) {
  const variant = product?.variants?.[variantIndex]
  return (product?.sizes ?? []).find((size) => variantStock(variant, size) > 0) ?? null
}
