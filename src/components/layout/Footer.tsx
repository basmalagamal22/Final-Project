'use client'

import Link from 'next/link'
import { ShoppingBag, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="h-7 w-7 text-primary-400" />
              <span className="text-xl font-bold text-white">FreshCart</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your one-stop shop for the freshest products at amazing prices. Quality you can trust, delivered to your door.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-primary-400 transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-primary-400 transition-colors">Products</Link></li>
              <li><Link href="/cart" className="hover:text-primary-400 transition-colors">Cart</Link></li>
              <li><Link href="/wishlist" className="hover:text-primary-400 transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary-400 transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-primary-400 transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-primary-400 transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="hover:text-primary-400 transition-colors"><Youtube className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} FreshCart. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
