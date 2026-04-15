import api from '@/lib/axios'

export const authService = {
  register: (data: {
    name: string
    email: string
    password: string
    rePassword: string
    phone: string
  }) => api.post('/auth/signup', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/signin', data),

  forgotPassword: (data: { email: string }) =>
    api.post('/auth/forgotPasswords', data),

  verifyResetCode: (data: { resetCode: string }) =>
    api.post('/auth/verifyResetCode', data),

  resetPassword: (data: { email: string; newPassword: string }) =>
    api.put('/auth/resetPassword', data),
}
