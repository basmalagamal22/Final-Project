import { create } from 'zustand'
import type { CartItem } from '@/types'

interface CartState {
  cartId: string | null
  items: CartItem[]
  numOfCartItems: number
  totalCartPrice: number
  totalAfterDiscount?: number
  setCart: (cartId: string, items: CartItem[], total: number, numOfItems: number, totalAfterDiscount?: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()((set) => ({
  cartId: null,
  items: [],
  numOfCartItems: 0,
  totalCartPrice: 0,
  totalAfterDiscount: undefined,
  setCart: (cartId, items, total, numOfItems, totalAfterDiscount) =>
    set({ cartId, items, totalCartPrice: total, numOfCartItems: numOfItems, totalAfterDiscount }),
  clearCart: () =>
    set({ cartId: null, items: [], numOfCartItems: 0, totalCartPrice: 0, totalAfterDiscount: undefined }),
}))
