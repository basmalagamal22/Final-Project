'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { wishlistService } from '@/services/wishlist.service'
import { cartService } from '@/services/cart.service'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import type { Product } from '@/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function WishlistPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { wishlistIds, setWishlist, removeFromWishlist } = useWishlistStore()
  const { setCart } = useCartStore()
  const [wishlistItems, setWishlistItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    const fetchWishlist = async () => {
      try {
        const res = await wishlistService.getWishlist()
        const products: Product[] = res.data.data
        setWishlistItems(products)
        setWishlist(products.map((p) => p._id))
      } catch {
        // Empty wishlist is fine
      } finally {
        setLoading(false)
      }
    }
    fetchWishlist()
  }, [isAuthenticated, router, setWishlist])

  const handleRemove = async (productId: string) => {
    setRemovingId(productId)
    try {
      await wishlistService.removeFromWishlist(productId)
      removeFromWishlist(productId)
      setWishlistItems((prev) => prev.filter((p) => p._id !== productId))
      toast.success('Removed from wishlist')
    } catch {
      toast.error('Failed to remove')
    } finally {
      setRemovingId(null)
    }
  }

  const handleMoveToCart = async (product: Product) => {
    setAddingToCartId(product._id)
    try {
      const res = await cartService.addToCart(product._id)
      const d = res.data
      setCart(d.data._id, d.data.products, d.data.totalCartPrice, d.numOfCartItems, d.data.totalAfterDiscount)
      // Also remove from wishlist
      await wishlistService.removeFromWishlist(product._id)
      removeFromWishlist(product._id)
      setWishlistItems((prev) => prev.filter((p) => p._id !== product._id))
      toast.success('Moved to cart!')
    } catch {
      toast.error('Failed to move to cart')
    } finally {
      setAddingToCartId(null)
    }
  }

  if (loading) return <LoadingSpinner size="lg" />
  if (!isAuthenticated) return null

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-rose-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <Heart className="h-12 w-12 text-rose-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-8">Save items you love to buy them later</p>
        <Link href="/products" className="btn-primary inline-flex items-center gap-2">
          Explore Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          My Wishlist <span className="text-rose-500 text-xl font-semibold">({wishlistIds.length} items)</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {wishlistItems.map((item) => (
          <div key={item._id} className="card group overflow-hidden flex flex-col">
            {/* Image */}
            <Link href={`/products/${item._id}`} className="relative aspect-square overflow-hidden bg-gray-100 block">
              <Image
                src={item.imageCover}
                alt={item.title}
                fill
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              {item.priceAfterDiscount && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  SALE
                </span>
              )}
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
              <p className="text-xs text-primary-600 font-medium mb-1">{item.category?.name}</p>
              <Link href={`/products/${item._id}`}>
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-3 group-hover:text-primary-600 transition-colors">
                  {item.title}
                </h3>
              </Link>

              {/* Price */}
              <div className="mb-4 mt-auto">
                {item.priceAfterDiscount ? (
                  <div>
                    <span className="text-base font-bold text-primary-700">EGP {item.priceAfterDiscount}</span>
                    <span className="text-sm text-gray-400 line-through ml-1">EGP {item.price}</span>
                  </div>
                ) : (
                  <span className="text-base font-bold text-primary-700">EGP {item.price}</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleMoveToCart(item)}
                  disabled={addingToCartId === item._id}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors disabled:opacity-60"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {addingToCartId === item._id ? 'Moving...' : 'Move to Cart'}
                </button>
                <button
                  onClick={() => handleRemove(item._id)}
                  disabled={removingId === item._id}
                  className="p-2 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                  title="Remove from wishlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
