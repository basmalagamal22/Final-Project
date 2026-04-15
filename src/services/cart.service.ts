import api from '@/lib/axios'

export const cartService = {
  getCart: () => api.get('/cart'),

  addToCart: (productId: string) =>
    api.post('/cart', { productId }),

  removeFromCart: (itemId: string) =>
    api.delete(`/cart/${itemId}`),

  updateQuantity: (itemId: string, count: number) =>
    api.put(`/cart/${itemId}`, { count }),

  clearCart: () => api.delete('/cart'),

  applyCoupon: (coupon: string) =>
    api.put('/cart/applyCoupon', { coupon }),
}
