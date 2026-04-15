'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import type { Product } from '@/types'
import { cartService } from '@/services/cart.service'
import { wishlistService } from '@/services/wishlist.service'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [addingToCart, setAddingToCart] = useState(false)
  const [togglingWish, setTogglingWish] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const { setCart } = useCartStore()
  const { wishlistIds, addToWishlist, removeFromWishlist } = useWishlistStore()
  const router = useRouter()
  const isWished = wishlistIds.includes(product._id)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) { router.push('/login'); return }
    setAddingToCart(true)
    try {
      const res = await cartService.addToCart(product._id)
      const data = res.data
      setCart(data.data._id, data.data.products, data.data.totalCartPrice, data.numOfCartItems)
      toast.success('Added to cart!')
    } catch {
      toast.error('Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) { router.push('/login'); return }
    setTogglingWish(true)
    try {
      if (isWished) {
        await wishlistService.removeFromWishlist(product._id)
        removeFromWishlist(product._id)
        toast.success('Removed from wishlist')
      } else {
        await wishlistService.addToWishlist(product._id)
        addToWishlist(product._id)
        toast.success('Added to wishlist!')
      }
    } catch {
      toast.error('Action failed')
    } finally {
      setTogglingWish(false)
    }
  }

  return (
    <Link href={`/products/${product._id}`} className="card group block overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={product.imageCover}
          alt={product.title}
          fill
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {product.priceAfterDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            SALE
          </span>
        )}
        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          disabled={togglingWish}
          className={`absolute top-2 right-2 p-1.5 rounded-full bg-white shadow transition-all duration-200 ${isWished ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'}`}
        >
          <Heart className={`h-4 w-4 ${isWished ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-primary-600 font-medium mb-1">{product.category?.name}</p>
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-gray-600">{product.ratingsAverage?.toFixed(1)} ({product.ratingsQuantity})</span>
        </div>

        {/* Price & Cart */}
        <div className="flex items-center justify-between">
          <div>
            {product.priceAfterDiscount ? (
              <div>
                <span className="text-base font-bold text-primary-700">EGP {product.priceAfterDiscount}</span>
                <span className="text-xs text-gray-400 line-through ml-1">EGP {product.price}</span>
              </div>
            ) : (
              <span className="text-base font-bold text-primary-700">EGP {product.price}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  )
}
