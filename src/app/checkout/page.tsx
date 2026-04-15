'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import Image from 'next/image'
import { CreditCard, Banknote, MapPin, Phone, Building, CheckCircle, ShieldCheck, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { ordersService } from '@/services/orders.service'
import { cartService } from '@/services/cart.service'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import type { CartItem, ShippingAddress } from '@/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

type PaymentMethod = 'cash' | 'online'

export default function CheckoutPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { cartId, items, numOfCartItems, totalCartPrice, totalAfterDiscount, clearCart } = useCartStore()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online')
  const [loading, setLoading] = useState(false)
  const [cartLoading, setCartLoading] = useState(true)
  const { setCart } = useCartStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingAddress>()

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    const ensureCart = async () => {
      if (!cartId) {
        try {
          const res = await cartService.getCart()
          const d = res.data
          setCart(d.data._id, d.data.products, d.data.totalCartPrice, d.numOfCartItems, d.data.totalAfterDiscount)
        } catch {
          // empty cart
        }
      }
      setCartLoading(false)
    }
    ensureCart()
  }, [isAuthenticated, router, cartId, setCart])

  const onSubmit = async (address: ShippingAddress) => {
    if (!cartId) { toast.error('Cart is empty'); return }
    setLoading(true)
    try {
      if (paymentMethod === 'cash') {
        await ordersService.createCashOrder(cartId, address)
        clearCart()
        toast.success('Order placed successfully!')
        router.push('/allorders')
      } else {
        const res = await ordersService.createOnlineOrder(cartId, address)
        const sessionUrl = res.data?.session?.url
        if (sessionUrl) {
          window.location.href = sessionUrl
        } else {
          toast.error('Could not initiate payment. Please try again.')
        }
      }
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Order failed')
    } finally {
      setLoading(false)
    }
  }

  if (cartLoading) return <LoadingSpinner size="lg" />

  if (!isAuthenticated) return null

  if (!items || items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Cart is empty</h2>
        <Link href="/products" className="btn-primary inline-block">Browse Products</Link>
      </div>
    )
  }

  const displayTotal = totalAfterDiscount ?? totalCartPrice

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Cart
      </button>

      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Form */}
        <div className="space-y-8">
          {/* Shipping Info */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Shipping Information
            </h2>
            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Building className="h-4 w-4 text-gray-400" /> City
                </label>
                <input
                  {...register('city', { required: 'City is required' })}
                  className="input-field"
                  placeholder="Cairo"
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
              </div>

              {/* Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-gray-400" /> Address Details
                </label>
                <input
                  {...register('details', { required: 'Address details are required' })}
                  className="input-field"
                  placeholder="Street name, building number, apartment..."
                />
                {errors.details && <p className="text-red-500 text-xs mt-1">{errors.details.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-gray-400" /> Phone Number
                </label>
                <input
                  {...register('phone', {
                    required: 'Phone is required',
                    pattern: { value: /^01[0125][0-9]{8}$/, message: 'Enter a valid Egyptian number (e.g. 01012345678)' },
                  })}
                  className="input-field"
                  placeholder="01012345678"
                  type="tel"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
            </form>
          </div>

          {/* Payment Method */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Payment Method
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: 'online', icon: CreditCard, label: 'Pay Online', sub: 'Secure card payment' },
                { id: 'cash', icon: Banknote, label: 'Cash on Delivery', sub: 'Pay when delivered' },
              ] as { id: PaymentMethod; icon: React.ElementType; label: string; sub: string }[]).map(({ id, icon: Icon, label, sub }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPaymentMethod(id)}
                  className={`relative p-4 rounded-xl border-2 flex flex-col items-center gap-2 text-center transition-all ${
                    paymentMethod === id
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-primary-300'
                  }`}
                >
                  <Icon className="h-7 w-7" />
                  <span className="font-semibold text-sm">{label}</span>
                  <span className="text-xs text-gray-400">{sub}</span>
                  {paymentMethod === id && (
                    <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-primary-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div>
          <div className="card p-6 sticky top-20">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

            {/* Items */}
            <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
              {items.map((item: CartItem) => (
                <div key={item._id} className="flex gap-3 items-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.product.imageCover}
                      alt={item.product.title}
                      width={56}
                      height={56}
                      className="object-contain w-full h-full p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.product.title}</p>
                    <p className="text-xs text-gray-400">x{item.count}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 ml-auto">EGP {item.price * item.count}</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 py-4 border-t border-gray-100">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({numOfCartItems} items)</span>
                <span>EGP {totalCartPrice}</span>
              </div>
              {totalAfterDiscount && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>- EGP {totalCartPrice - totalAfterDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-4 mb-6">
              <span>Total</span>
              <span className="text-primary-700">EGP {displayTotal}</span>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 text-base"
            >
              {loading
                ? 'Processing...'
                : paymentMethod === 'online'
                  ? 'Pay Now'
                  : 'Place Order'}
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure & encrypted checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
