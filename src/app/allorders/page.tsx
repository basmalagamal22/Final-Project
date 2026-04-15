'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Truck, CheckCircle, Clock, CreditCard, Banknote, ChevronDown, ChevronUp, ShoppingBag, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { ordersService } from '@/services/orders.service'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import type { Order } from '@/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function AllOrdersPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const { clearCart } = useCartStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [justOrdered, setJustOrdered] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }

    // Check if came from a successful payment (Stripe redirects back here)
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get('status') === 'success' || document.referrer.includes('stripe')) {
      clearCart()
      setJustOrdered(true)
      toast.success('Payment successful! Order placed.')
    }

    const fetchOrders = async () => {
      try {
        if (!user?._id) return
        const res = await ordersService.getUserOrders(user._id)
        const data = Array.isArray(res.data) ? res.data : res.data.data ?? []
        setOrders(data.reverse()) // newest first
      } catch {
        toast.error('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [isAuthenticated, router, user, clearCart])

  if (loading) return <LoadingSpinner size="lg" />
  if (!isAuthenticated) return null

  const getStatusColor = (order: Order) => {
    if (order.isDelivered) return 'text-green-600 bg-green-50'
    if (order.isPaid) return 'text-blue-600 bg-blue-50'
    return 'text-yellow-600 bg-yellow-50'
  }

  const getStatusLabel = (order: Order) => {
    if (order.isDelivered) return 'Delivered'
    if (order.isPaid) return 'Paid — Processing'
    return 'Pending Payment'
  }

  const getStatusIcon = (order: Order) => {
    if (order.isDelivered) return Truck
    if (order.isPaid) return Package
    return Clock
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Success Banner */}
      {justOrdered && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-8 flex items-start gap-4">
          <CheckCircle className="h-8 w-8 text-green-500 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold text-green-800 text-lg">Order Placed Successfully! 🎉</h2>
            <p className="text-green-700 text-sm mt-1">
              Thank you for your purchase. Your order is being processed and will be delivered soon.
            </p>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No orders yet</h2>
          <p className="text-gray-500 mb-8">Start shopping to see your orders here</p>
          <Link href="/products" className="btn-primary inline-flex items-center gap-2">
            Browse Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const StatusIcon = getStatusIcon(order)
            const isExpanded = expandedOrder === order._id

            return (
              <div key={order._id} className="card overflow-hidden">
                {/* Order Header */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl ${getStatusColor(order)}`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Order #{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(order)}`}>
                          <StatusIcon className="h-3 w-3" />
                          {getStatusLabel(order)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          {order.paymentMethodType === 'card' ? (
                            <><CreditCard className="h-3 w-3" /> Online</>
                          ) : (
                            <><Banknote className="h-3 w-3" /> Cash on Delivery</>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-auto">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{order.cartItems.length} item{order.cartItems.length !== 1 ? 's' : ''}</p>
                      <p className="font-bold text-primary-700 text-lg">EGP {order.totalOrderPrice}</p>
                    </div>
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Order Items */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5">
                    <div className="space-y-3 mb-4">
                      {order.cartItems.map((item) => (
                        <div key={item._id} className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={item.product.imageCover}
                              alt={item.product.title}
                              width={48}
                              height={48}
                              className="object-contain w-full h-full p-1"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.product.title}</p>
                            <p className="text-xs text-gray-400">Qty: {item.count}</p>
                          </div>
                          <p className="text-sm font-semibold">EGP {item.price * item.count}</p>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-gray-50 rounded-xl p-4 mt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Shipping Address</p>
                      <p className="text-sm text-gray-700">{order.shippingAddress.details}</p>
                      <p className="text-sm text-gray-700">{order.shippingAddress.city}</p>
                      <p className="text-sm text-gray-700">{order.shippingAddress.phone}</p>
                    </div>

                    {/* Timestamps */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {order.isPaid && order.paidAt && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-blue-600">Paid At</p>
                          <p className="text-xs text-gray-600 mt-0.5">{new Date(order.paidAt).toLocaleDateString()}</p>
                        </div>
                      )}
                      {order.isDelivered && order.deliveredAt && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-green-600">Delivered At</p>
                          <p className="text-xs text-gray-600 mt-0.5">{new Date(order.deliveredAt).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
