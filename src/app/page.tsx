'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, Truck, Shield, RefreshCw } from 'lucide-react'
import { productsService } from '@/services/products.service'
import type { Product, Category } from '@/types'
import ProductCard from '@/components/ui/ProductCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productsService.getAll({ limit: 8 }),
          productsService.getCategories(),
        ])
        setProducts(productsRes.data.data)
        setCategories(categoriesRes.data.data.slice(0, 6))
      } catch {
        console.error('Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-linear-to-br from-primary-600 via-primary-700 to-primary-900 text-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Shop the Latest <br />
            <span className="text-primary-200">Products</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Discover thousands of products at unbeatable prices. From electronics to fashion — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="bg-gray-800 text-olive-50 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors inline-flex items-center gap-2">
              Shop Now <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/register" className="border-2 border-white text-slate-900 font-bold px-8 py-3 rounded-xl hover:bg-gray-600 hover:text-primary-700 transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over EGP 500' },
              { icon: Shield, title: 'Secure Payment', desc: '100% protected transactions' },
              { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-3">
                <div className="bg-primary-100 p-4 rounded-full">
                  <Icon className="h-7 w-7 text-primary-600" />
                </div>
                <h3 className="font-bold text-gray-800">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900">Shop by Category</h2>
              <Link href="/products" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/products?category=${cat._id}`}
                  className="card p-4 text-center hover:border-primary-500 border-2 border-transparent transition-all"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cat.image} alt={cat.name} className="h-16 w-16 object-contain mx-auto mb-2 rounded-full" />
                  <p className="text-sm font-medium text-gray-700 truncate">{cat.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900">Latest Products</h2>
            <Link href="/products" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShoppingBag className="h-14 w-14 text-white mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Start Shopping Today</h2>
          <p className="text-primary-100 mb-8 max-w-lg mx-auto">Create your free account and enjoy exclusive deals, fast delivery, and much more.</p>
          <Link href="/register" className="bg-gray-700 text-white font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors inline-block">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  )
}
