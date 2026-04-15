'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { ShoppingCart, Heart, Star, ArrowLeft, Minus, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { productsService } from '@/services/products.service'
import { cartService } from '@/services/cart.service'
import { wishlistService } from '@/services/wishlist.service'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useAuthStore } from '@/store/authStore'
import type { Product } from '@/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [togglingWish, setTogglingWish] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const { setCart } = useCartStore()
  const { wishlistIds, addToWishlist, removeFromWishlist } = useWishlistStore()

  const isWished = product ? wishlistIds.includes(product._id) : false

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productsService.getById(id)
        const p = res.data.data
        setProduct(p)
        setSelectedImage(p.imageCover)
      } catch {
        toast.error('Product not found')
        router.push('/products')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id, router])

  const handleAddToCart = async () => {
    if (!isAuthenticated) { router.push('/login'); return }
    if (!product) return
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

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) { router.push('/login'); return }
    if (!product) return
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

  if (loading) return <LoadingSpinner size="lg" />
  if (!product) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-4 aspect-square flex items-center justify-center p-6">
            <Image
              src={selectedImage || product.imageCover}
              alt={product.title}
              width={400}
              height={400}
              className="object-contain w-full h-full"
            />
          </div>
          {product.images?.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[product.imageCover, ...product.images].map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${selectedImage === img ? 'border-primary-500' : 'border-transparent'}`}
                >
                  <Image src={img} alt="" width={80} height={80} className="object-contain w-full h-full p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-primary-600 font-medium text-sm mb-1">{product.category?.name} · {product.brand?.name}</p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug">{product.title}</h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.round(product.ratingsAverage) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm text-gray-500">({product.ratingsQuantity} reviews)</span>
          </div>

          {/* Price */}
          <div>
            {product.priceAfterDiscount ? (
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-primary-700">EGP {product.priceAfterDiscount}</span>
                <span className="text-lg text-gray-400 line-through">EGP {product.price}</span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-full">
                  {Math.round(((product.price - product.priceAfterDiscount) / product.price) * 100)}% OFF
                </span>
              </div>
            ) : (
              <span className="text-3xl font-extrabold text-primary-700">EGP {product.price}</span>
            )}
          </div>

          {/* Stock */}
          <p className="text-sm text-gray-500">
            <span className={product.quantity > 0 ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
              {product.quantity > 0 ? `In Stock (${product.quantity} left)` : 'Out of Stock'}
            </span>
            {product.sold > 0 && <span className="ml-3 text-gray-400">· {product.sold} sold</span>}
          </p>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-2 hover:bg-gray-100 rounded-l-lg">
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-5 py-2 font-semibold text-gray-800">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="p-2 hover:bg-gray-100 rounded-r-lg">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.quantity === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              onClick={handleToggleWishlist}
              disabled={togglingWish}
              className={`p-3 rounded-xl border-2 transition-all ${isWished ? 'border-rose-500 bg-rose-50 text-rose-500' : 'border-gray-200 text-gray-500 hover:border-rose-300 hover:text-rose-400'}`}
            >
              <Heart className={`h-6 w-6 ${isWished ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
