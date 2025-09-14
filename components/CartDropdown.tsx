'use client'

import { useState, useRef, useEffect } from 'react'
import { ShoppingCart, X, Trash2, ArrowRight } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

export default function CartDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const { state, removeItem, updateQuantity, clearCart } = useCart()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleRemoveItem = (id: number) => {
    removeItem(id)
  }

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity)
    }
  }

  const handleClearCart = () => {
    clearCart()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-leather-600 hover:text-atlantic-primary transition-colors duration-200"
      >
        <ShoppingCart className="w-6 h-6" />
        {state.totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-atlantic-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {state.totalItems}
          </span>
        )}
        <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-leather-600 whitespace-nowrap">
          Orders
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-leather-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-leather-200">
            <h3 className="text-lg font-semibold text-leather-900">Your Orders</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-leather-400 hover:text-leather-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="max-h-96 overflow-y-auto">
            {state.items.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingCart className="w-16 h-16 text-leather-300 mx-auto mb-4" />
                <p className="text-leather-600 mb-2">Your order cart is empty</p>
                <p className="text-sm text-leather-500">Start adding products to place your order</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {state.items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-center space-x-3 p-3 bg-leather-50 rounded-lg">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-leather-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-leather-900 text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-leather-600">{item.category}</p>
                      {item.size && <p className="text-xs text-leather-500">Size: {item.size}</p>}
                      {item.color && <p className="text-xs text-leather-500">Color: {item.color}</p>}
                      <p className="text-sm font-semibold text-atlantic-primary">{formatPrice(item.price)}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-6 h-6 border border-leather-200 rounded flex items-center justify-center text-leather-600 hover:bg-leather-100 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-6 h-6 border border-leather-200 rounded flex items-center justify-center text-leather-600 hover:bg-leather-100 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-leather-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {state.items.length > 0 && (
            <div className="p-4 border-t border-leather-200 bg-leather-50 rounded-b-2xl">
              {/* Total */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-leather-900">Total:</span>
                <span className="text-xl font-bold text-atlantic-primary">{formatPrice(state.totalAmount)}</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-gradient-to-r from-atlantic-primary to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Review Orders</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                
                <button
                  onClick={handleClearCart}
                  className="w-full bg-leather-100 text-leather-700 py-2 px-4 rounded-lg font-medium hover:bg-leather-200 transition-colors duration-200"
                >
                  Clear All Orders
                </button>
              </div>

              {/* Order Notice */}
              <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-800 text-center">
                  <strong>Order-Only System:</strong> We'll contact you to arrange payment and delivery
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
