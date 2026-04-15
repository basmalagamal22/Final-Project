'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ShoppingBag } from 'lucide-react'
import { authService } from '@/services/auth.service'

type Step = 'email' | 'code' | 'reset'

export default function ForgetPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const router = useRouter()

  const emailForm = useForm<{ email: string }>()
  const codeForm = useForm<{ resetCode: string }>()
  const resetForm = useForm<{ newPassword: string }>()

  const handleSendEmail = async (data: { email: string }) => {
    setLoading(true)
    try {
      await authService.forgotPassword(data)
      setEmail(data.email)
      toast.success('Reset code sent to your email!')
      setStep('code')
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Email not found')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (data: { resetCode: string }) => {
    setLoading(true)
    try {
      await authService.verifyResetCode(data)
      toast.success('Code verified!')
      setStep('reset')
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (data: { newPassword: string }) => {
    setLoading(true)
    try {
      await authService.resetPassword({ email, newPassword: data.newPassword })
      toast.success('Password reset! Please sign in.')
      router.push('/login')
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-primary-600 p-3 rounded-2xl">
              <ShoppingBag className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Reset Password</h1>
          <p className="text-gray-500 mt-1">
            {step === 'email' && "We'll send a reset code to your email"}
            {step === 'code' && 'Enter the 6-digit code we sent you'}
            {step === 'reset' && 'Create your new password'}
          </p>
        </div>

        {/* Progress Pills */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(['email', 'code', 'reset'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step === s || (s === 'email' && step !== 'email') || (s === 'code' && step === 'reset') ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i + 1}
              </div>
              {i < 2 && <div className={`h-0.5 w-8 ${(s === 'email' && step !== 'email') || (s === 'code' && step === 'reset') ? 'bg-primary-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="card p-8">
          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={emailForm.handleSubmit(handleSendEmail)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  {...emailForm.register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                  })}
                  type="email"
                  placeholder="you@example.com"
                  className="input-field"
                />
                {emailForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{emailForm.formState.errors.email.message}</p>
                )}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          )}

          {/* Step 2: Verify Code */}
          {step === 'code' && (
            <form onSubmit={codeForm.handleSubmit(handleVerifyCode)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reset Code</label>
                <input
                  {...codeForm.register('resetCode', {
                    required: 'Code is required',
                    minLength: { value: 6, message: 'Code must be 6 digits' },
                  })}
                  type="text"
                  placeholder="123456"
                  className="input-field text-center text-lg tracking-widest"
                  maxLength={6}
                />
                {codeForm.formState.errors.resetCode && (
                  <p className="text-red-500 text-xs mt-1">{codeForm.formState.errors.resetCode.message}</p>
                )}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button type="button" onClick={() => setStep('email')} className="w-full text-sm text-gray-500 hover:text-primary-600 text-center">
                ← Send again
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 'reset' && (
            <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  {...resetForm.register('newPassword', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Min 6 characters' },
                  })}
                  type="password"
                  placeholder="••••••••"
                  className="input-field"
                />
                {resetForm.formState.errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">{resetForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Remember your password?{' '}
            <Link href="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
