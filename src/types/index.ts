// ─── Auth Types ───────────────────────────────────────────────────────────────
export interface User {
  _id: string
  name: string
  email: string
  phone: string
  role: string
  token?: string
}

export interface AuthResponse {
  message: string
  user?: User
  token?: string
}

// ─── Product Types ────────────────────────────────────────────────────────────
export interface Category {
  _id: string
  name: string
  slug: string
  image: string
}

export interface Brand {
  _id: string
  name: string
  slug: string
  image: string
}

export interface Product {
  _id: string
  title: string
  slug: string
  description: string
  quantity: number
  sold: number
  price: number
  priceAfterDiscount?: number
  imageCover: string
  images: string[]
  category: Category
  brand: Brand
  ratingsAverage: number
  ratingsQuantity: number
}

export interface ProductsResponse {
  results: number
  metadata: {
    currentPage: number
    numberOfPages: number
    limit: number
  }
  data: Product[]
}

// ─── Cart Types ───────────────────────────────────────────────────────────────
export interface CartItem {
  _id: string
  product: Product
  count: number
  price: number
}

export interface Cart {
  _id: string
  cartOwner: string
  products: CartItem[]
  totalCartPrice: number
  totalAfterDiscount?: number
}

export interface CartResponse {
  status: string
  numOfCartItems: number
  cartId: string
  data: Cart
}

// ─── Wishlist Types ───────────────────────────────────────────────────────────
export interface WishlistResponse {
  status: string
  count: number
  data: Product[]
}

// ─── Order Types ──────────────────────────────────────────────────────────────
export interface ShippingAddress {
  details: string
  phone: string
  city: string
}

export interface Order {
  _id: string
  user: User
  cartItems: CartItem[]
  shippingAddress: ShippingAddress
  totalOrderPrice: number
  paymentMethodType: 'cash' | 'card'
  isPaid: boolean
  isDelivered: boolean
  paidAt?: string
  deliveredAt?: string
  createdAt: string
}
