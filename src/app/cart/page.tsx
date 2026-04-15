'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import { cartService } from '@/services/cart.service'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import type { CartItem } from '@/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function CartPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { cartId, items, numOfCartItems, totalCartPrice, totalAfterDiscount, setCart, clearCart } = useCartStore()
  const [loading, setLoading] = useState(true)
  const [coupon, setCoupon] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    const fetchCart = async () => {
      try {
        const res = await cartService.getCart()
        const d = res.data
        setCart(d.data._id, d.data.products, d.data.totalCartPrice, d.numOfCartItems, d.data.totalAfterDiscount)
      } catch {
        // Cart might be empty — that's fine
      } finally {
        setLoading(false)
      }
    }
    fetchCart()
  }, [isAuthenticated, router, setCart])

  const handleUpdateQty = async (itemId: string, count: number) => {
    if (count < 1) return
    setUpdatingId(itemId)
    try {
      const res = await cartService.updateQuantity(itemId, count)
      const d = res.data
      setCart(d.data._id, d.data.products, d.data.totalCartPrice, d.numOfCartItems, d.data.totalAfterDiscount)
    } catch {
      toast.error('Failed to update quantity')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRemove = async (itemId: string) => {
    setRemovingId(itemId)
    try {
      const res = await cartService.removeFromCart(itemId)
      const d = res.data
      setCart(d.data._id, d.data.products, d.data.totalCartPrice, d.numOfCartItems, d.data.totalAfterDiscount)
      toast.success('Item removed')
    } catch {
      toast.error('Failed to remove item')
    } finally {
      setRemovingId(null)
    }
  }

  const handleClearCart = async () => {
    try {
      await cartService.clearCart()
      clearCart()
      toast.success('Cart cleared')
    } catch {
      toast.error('Failed to clear cart')
    }
  }

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return
    setApplyingCoupon(true)
    try {
      const res = await cartService.applyCoupon(coupon.trim())
      const d = res.data
      setCart(d.data._id, d.data.products, d.data.totalCartPrice, d.numOfCartItems, d.data.totalAfterDiscount)
      toast.success('Coupon applied!')
      setCoupon('')
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid coupon')
    } finally {
      setApplyingCoupon(false)
    }
  }

  if (loading) return <LoadingSpinner size="lg" />

  if (!isAuthenticated) return null

  if (!items || items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-primary-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-12 w-12 text-primary-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Add some products to get started</p>
        <Link href="/products" className="btn-primary inline-flex items-center gap-2">
          Browse Products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  const displayTotal = totalAfterDiscount ?? totalCartPrice
  const savedAmount = totalAfterDiscount ? totalCartPrice - totalAfterDiscount : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Shopping Cart <span className="text-primary-600 text-xl font-semibold">({numOfCartItems} items)</span>
        </h1>
        <button onClick={handleClearCart} className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors">
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item: CartItem) => (
            <div key={item._id} className="card p-4 flex flex-col sm:flex-row gap-4">
              <Link href={`/products/${item.product._id}`} className="flex-shrink-0">
                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden">
                  <Image
                    src={item.product.imageCover}
                    alt={item.product.title}
                    width={96}
                    height={96}
                    className="object-contain w-full h-full p-2"
                  />
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/products/${item.product._id}`}>
                    <h3 className="font-semibold text-gray-800 text-sm leading-snug hover:text-primary-600 transition-colors line-clamp-2">
                      {item.product.title}
                    </h3>
                  </Link>
                  <button
                    onClick={() => handleRemove(item.product._id)}
                    disabled={removingId === item.product._id}
                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 p-1 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-xs text-gray-400 mt-1">{item.product.category?.name}</p>

                <div className="flex items-center justify-between mt-3">
                  {/* Quantity */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleUpdateQty(item.product._id, item.count - 1)}
                      disabled={item.count <= 1 || updatingId === item.product._id}
                      className="p-1.5 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-3 py-1 text-sm font-semibold min-w-[2rem] text-center">
                      {updatingId === item.product._id ? '...' : item.count}
                    </span>
                    <button
                      onClick={() => handleUpdateQty(item.product._id, item.count + 1)}
                      disabled={updatingId === item.product._id}
                      className="p-1.5 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-bold text-primary-700">EGP {item.price * item.count}</p>
                    {item.count > 1 && (
                      <p className="text-xs text-gray-400">EGP {item.price} each</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({numOfCartItems} items)</span>
                <span>EGP {totalCartPrice}</span>
              </div>
              {savedAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>- EGP {savedAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary-700">EGP {displayTotal}</span>
              </div>
            </div>

            {/* Coupon */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Tag className="h-4 w-4" /> Coupon Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Enter coupon..."
                  className="input-field flex-1 py-2 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !coupon.trim()}
                  className="btn-outline text-sm py-2 px-4 disabled:opacity-50"
                >
                  {applyingCoupon ? '...' : 'Apply'}
                </button>
              </div>
            </div>

            <Link
              href="/checkout"
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Link>

            <Link href="/products" className="block text-center text-sm text-primary-600 hover:underline mt-4">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
