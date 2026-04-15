'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Heart, Menu, X, ShoppingBag } from 'lucide-react'
import { useContext, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const { numOfCartItems } = useCartStore()
  const { wishlistIds } = useWishlistStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    router.push('/login')
  }
  


  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <ShoppingBag className="h-7 w-7 text-primary-600" />
            <span className="text-xl font-bold text-primary-600">FreshCart</span>
          </Link>

          {/* Desktop Nav Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Home</Link>
              <Link href="/products" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Products</Link>
              <Link href="/allorders" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Orders</Link>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Wishlist */}
                <Link href="/wishlist" className="relative p-2 text-gray-600 hover:text-rose-500 transition-colors">
                  <Heart className="h-6 w-6" />
                  {wishlistIds.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {wishlistIds.length}
                    </span>
                  )}
                </Link>
                {/* Cart */}
               
        
 <Link href='/cart' className="relative p-2 text-gray-600 hover:text-rose-500 transition-colors">
  <ShoppingCart className="h-7 w-7 text-primary-600" />
  
  {numOfCartItems > 0 && (
    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
      {numOfCartItems}
    </span>
  )}
 </Link>

                {/* User */}
                <span className="hidden md:block text-sm text-gray-900">Hi, {user?.name?.split(' ')[0]}</span>
                <button onClick={handleLogout} className="btn-gray-700 border-2 rounded-2xl hover:bg-gray-300 text-sm py-1.5 px-4">
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link href="/login" className="btn-outline text-sm py-1.5 px-4">Login</Link>
                <Link href="/register" className="btn-gray-700 text-sm py-1.5 px-4">Register</Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && isAuthenticated && (
          <div className="md:hidden pb-4 flex flex-col gap-3">
            <Link href="/" onClick={() => setMenuOpen(false)} className="px-2 py-1 text-gray-600 hover:text-primary-600 font-medium">Home</Link>
            <Link href="/products" onClick={() => setMenuOpen(false)} className="px-2 py-1 text-gray-600 hover:text-primary-600 font-medium">Products</Link>
            <Link href="/allorders" onClick={() => setMenuOpen(false)} className="px-2 py-1 text-gray-600 hover:text-primary-600 font-medium">Orders</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
