import api from '@/lib/axios'

export const ordersService = {
  createCashOrder: (cartId: string, shippingAddress: { details: string; phone: string; city: string }) =>
    api.post(`/orders/${cartId}`, { shippingAddress }),

  createOnlineOrder: (cartId: string, shippingAddress: { details: string; phone: string; city: string }) =>
    api.post(`/orders/checkout-session/${cartId}?url=${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}`, { shippingAddress }),

  getUserOrders: (userId: string) =>
    api.get(`/orders/user/${userId}`),
}
