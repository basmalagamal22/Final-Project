import api from '@/lib/axios'

export const productsService = {
  getAll: (params?: { page?: number; limit?: number; keyword?: string; sort?: string; category?: string }) =>
    api.get('/products', { params }),

  getById: (id: string) => api.get(`/products/${id}`),

  getCategories: () => api.get('/categories'),

  getBrands: () => api.get('/brands'),
}
