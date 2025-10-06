export type Product = {
  id: number
  name: string
  brand?: string
  presentation?: string
  unit: string
  category?: string
}

export type CartItem = {
  productId?: number
  name: string
  quantity: number
  unit: string
  notes?: string
}

export type RequestDTO = {
  requester: string
  items: CartItem[]
}
