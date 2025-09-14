'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'

export interface CartItem {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  size?: string
  color?: string
  quantity: number
  material: string
}

interface CartState {
  items: CartItem[]
  totalItems: number
  totalAmount: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'UPDATE_OPTIONS'; payload: { id: number; size?: string; color?: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
}

const cartReducer = (state: CartState, action: CartAction): CartState => {

  
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id && 
                item.size === action.payload.size && 
                item.color === action.payload.color
      )


      if (existingItemIndex > -1) {
        // Update existing item quantity
        const updatedItems = [...state.items]
        updatedItems[existingItemIndex].quantity += action.payload.quantity
        
        const newState = {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems + action.payload.quantity,
          totalAmount: state.totalAmount + (action.payload.price * action.payload.quantity)
        }
        return newState
      } else {
        // Add new item
        const newState = {
          ...state,
          items: [...state.items, action.payload],
          totalItems: state.totalItems + action.payload.quantity,
          totalAmount: state.totalAmount + (action.payload.price * action.payload.quantity)
        }
        return newState
      }
    }

    case 'REMOVE_ITEM': {
      const itemToRemove = state.items.find(item => item.id === action.payload)
      if (!itemToRemove) return state

      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        totalItems: state.totalItems - itemToRemove.quantity,
        totalAmount: state.totalAmount - (itemToRemove.price * itemToRemove.quantity)
      }
    }

    case 'UPDATE_QUANTITY': {
      const itemIndex = state.items.findIndex(item => item.id === action.payload.id)
      if (itemIndex === -1) return state

      const updatedItems = [...state.items]
      const oldQuantity = updatedItems[itemIndex].quantity
      const newQuantity = action.payload.quantity
      
      updatedItems[itemIndex].quantity = newQuantity

      return {
        ...state,
        items: updatedItems,
        totalItems: state.totalItems - oldQuantity + newQuantity,
        totalAmount: state.totalAmount - (updatedItems[itemIndex].price * oldQuantity) + (updatedItems[itemIndex].price * newQuantity)
      }
    }

    case 'UPDATE_OPTIONS': {
      const itemIndex = state.items.findIndex(item => item.id === action.payload.id)
      if (itemIndex === -1) return state

      const updatedItems = [...state.items]
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        size: action.payload.size || updatedItems[itemIndex].size,
        color: action.payload.color || updatedItems[itemIndex].color
      }

      return {
        ...state,
        items: updatedItems
      }
    }

    case 'CLEAR_CART':
      return initialState

    case 'LOAD_CART': {
      const totalItems = action.payload.reduce((sum, item) => sum + item.quantity, 0)
      const totalAmount = action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      return {
        items: action.payload,
        totalItems,
        totalAmount
      }
    }

    default:
      return state
  }
}

interface CartContextType {
  state: CartState
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity: number }) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  updateOptions: (id: number, size?: string, color?: string) => void
  clearCart: () => void
  isInCart: (id: number, size?: string, color?: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('atlantic-leather-cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', payload: parsedCart })
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('atlantic-leather-cart', JSON.stringify(state.items))
  }, [state.items])

  const addItem = (item: Omit<CartItem, 'quantity'> & { quantity: number }) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }

  const removeItem = (id: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
    }
  }

  const updateOptions = (id: number, size?: string, color?: string) => {
    dispatch({ type: 'UPDATE_OPTIONS', payload: { id, size, color } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const isInCart = (id: number, size?: string, color?: string) => {
    return state.items.some(item => 
      item.id === id && 
      item.size === size && 
      item.color === color
    )
  }

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    updateOptions,
    clearCart,
    isInCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}
