'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { Trash2, Minus, Plus, ArrowLeft, User, Mail, Phone, CheckCircle, ShoppingCart } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { publicApiClient } from '@/lib/publicApi'
import 'react-toastify/dist/ReactToastify.css'
import Dialog from '@/components/ui/Dialog'

export default function CartPage() {
  const { state, removeItem, updateQuantity, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})

  // Dialog states
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [showValidationDialog, setShowValidationDialog] = useState(false)
  const [itemToRemove, setItemToRemove] = useState<number | null>(null)
  const [validationMessage, setValidationMessage] = useState('')

  const handleRemoveItem = (id: number) => {
    setItemToRemove(id)
    setShowRemoveDialog(true)
  }

  const confirmRemoveItem = () => {
    if (itemToRemove !== null) {
      removeItem(itemToRemove)
      toast.success('Item removed from cart')
      setItemToRemove(null)
    }
  }

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity)
      toast.success('Quantity updated')
    } else if (newQuantity === 0) {
      setItemToRemove(id)
      setShowRemoveDialog(true)
    }
  }

  const handleClearCart = () => {
    setShowClearDialog(true)
  }

  const confirmClearCart = () => {
    clearCart()
    toast.success('Cart cleared successfully')
  }

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!customerInfo.name.trim()) errors.name = 'Name is required'
    if (!customerInfo.email.trim()) errors.email = 'Email is required'
    if (!customerInfo.phone.trim()) errors.phone = 'Phone is required'
    
    // Basic email validation
    if (customerInfo.email && !/\S+@\S+\.\S+/.test(customerInfo.email)) {
      errors.email = 'Please enter a valid email'
    }

    // Check if all items have size and color selected
    const missingOptions = state.items.filter(item => !item.size || !item.color)
    if (missingOptions.length > 0) {
      const itemNames = missingOptions.map(item => item.name).join(', ')
      setValidationMessage(`The following items are missing size or color selections: ${itemNames}. Please select options for all items before proceeding.`)
      setShowValidationDialog(true)
      return false
    }
    
    setFormErrors(errors)
    
    if (Object.keys(errors).length > 0) {
      toast.error('Please fill in all required fields correctly')
      return false
    }
    
    return true
  }

  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const orderData = {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        items: state.items.map(item => ({
          productId: item.id,
          product_name: item.name,
          product_image: item.image,
          product_category: item.category,
          quantity: item.quantity,
          price: item.price,
          original_price: item.originalPrice,
          size: item.size,
          color: item.color
        })),
        totalAmount: state.totalAmount,
        notes: customerInfo.notes
      }

      const response = await publicApiClient.submitOrder(orderData)
      
      if (response.success) {
        setOrderSubmitted(true)
        clearCart()
        toast.success('Order submitted successfully! We will contact you within 24 hours for payment and delivery details.')
      } else {
        toast.error(`Order submission failed: ${response.error}`)
      }
    } catch (error) {
      console.error('Order submission error:', error)
      toast.error('Failed to submit order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-leather-900 mb-4">Order Submitted!</h1>
          <p className="text-leather-600 mb-6">
            Thank you for your order. We'll contact you within 24 hours to arrange payment and delivery details.
          </p>
          <Link href="/products" className="atlantic-button">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-leather-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-leather-400" />
          </div>
          <h1 className="text-3xl font-bold text-leather-900 mb-4">Your Order Cart is Empty</h1>
          <p className="text-leather-600 mb-6">
            Start adding products to place your order. We'll contact you to arrange payment and delivery.
          </p>
          <Link href="/products" className="atlantic-button">
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-leather-50 border-b border-leather-200">
        <div className="container-custom py-4">
          <div className="flex items-center space-x-4">
            <Link href="/products" className="text-leather-600 hover:text-atlantic-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-leather-900">Review Your Orders</h1>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-leather-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-leather-900">Order Items ({state.totalItems})</h2>
                <button
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                >
                  Clear All
                </button>
              </div>
              
              {/* Order Items List */}
              <div className="space-y-3">
                {state.items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-center space-x-3 p-3 bg-leather-50 rounded-lg">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={60}
                        height={60}
                        className="w-15 h-15 object-cover rounded-lg"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold text-leather-900 text-sm truncate">{item.name}</h3>
                      <p className="text-leather-600 text-xs">{item.category}</p>
                      <div className="flex items-center space-x-3 text-xs text-leather-600 mt-1">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-leather-100 hover:bg-leather-200 rounded-full flex items-center justify-center transition-colors"
                      >
                        <span className="text-leather-700 font-bold">-</span>
                      </button>
                      <span className="w-8 text-center font-medium text-leather-900">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-leather-100 hover:bg-leather-200 rounded-full flex items-center justify-center transition-colors"
                      >
                        <span className="text-leather-700 font-bold">+</span>
                      </button>
                    </div>
                    
                    {/* Price and Remove */}
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-atlantic-primary text-sm">ETB {formatPrice(item.price * item.quantity)}</span>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg border border-leather-200 p-4 mt-4">
              <h2 className="text-xl font-bold text-leather-900 mb-3">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-leather-600">
                  <span>Subtotal:</span>
                  <span className="font-medium">ETB {formatPrice(state.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-leather-600">
                  <span>Shipping:</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="border-t border-leather-200 pt-2">
                  <div className="flex justify-between text-lg font-bold text-leather-900">
                    <span>Total:</span>
                    <span>ETB {formatPrice(state.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-leather-200 p-4">
              <h2 className="text-xl font-bold text-leather-900 mb-4">Customer Information</h2>
              
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitOrder(); }} className="space-y-3">
                {/* Full Name */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-leather-700 mb-1">
                    <User className="w-4 h-4" />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 border border-leather-200 rounded-lg focus:ring-2 focus:ring-atlantic-primary focus:border-transparent"
                    required
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                {/* Email Address */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-leather-700 mb-1">
                    <Mail className="w-4 h-4" />
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email address"
                    className="w-full px-3 py-2 border border-leather-200 rounded-lg focus:ring-2 focus:ring-atlantic-primary focus:border-transparent"
                    required
                  />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-leather-700 mb-1">
                    <Phone className="w-4 h-4" />
                    <span>Phone Number *</span>
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                    className="w-full px-3 py-2 border border-leather-200 rounded-lg focus:ring-2 focus:ring-atlantic-primary focus:border-transparent"
                    required
                  />
                  {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-leather-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special requests or delivery instructions..."
                    rows={3}
                    className="w-full px-3 py-2 border border-leather-200 rounded-lg focus:ring-2 focus:ring-atlantic-primary focus:border-transparent resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || state.items.length === 0}
                  className="w-full bg-atlantic-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-atlantic-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-4"
                >
                  {isSubmitting ? 'Submitting Order...' : 'Submit Order'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500'
        }}
      />

      {/* Remove Item Confirmation Dialog */}
      <Dialog
        isOpen={showRemoveDialog}
        onClose={() => setShowRemoveDialog(false)}
        onConfirm={confirmRemoveItem}
        title="Remove Item"
        message="Are you sure you want to remove this item from your cart?"
        type="confirm"
        confirmText="Remove"
        cancelText="Keep Item"
      />

      {/* Clear Cart Confirmation Dialog */}
      <Dialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={confirmClearCart}
        title="Clear Cart"
        message="Are you sure you want to remove all items from your cart? This action cannot be undone."
        type="warning"
        confirmText="Clear All"
        cancelText="Cancel"
      />

      {/* Validation Dialog */}
      <Dialog
        isOpen={showValidationDialog}
        onClose={() => setShowValidationDialog(false)}
        title="Missing Information"
        message={validationMessage}
        type="error"
        confirmText="OK"
        showCancel={false}
      />
    </div>
  )
}
