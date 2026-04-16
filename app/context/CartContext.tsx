'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product, ProductVariant, ProductAddon } from '../data/products'

export interface CartItem {
  product: Product
  quantity: number
  variant?: ProductVariant
  addon?: ProductAddon
  cartKey: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, variant?: ProductVariant, addon?: ProductAddon, qty?: number) => void
  removeItem: (cartKey: string) => void
  updateQuantity: (cartKey: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

function makeCartKey(productId: string, variantLabel?: string, addonLabel?: string): string {
  return `${productId}|${variantLabel ?? ''}|${addonLabel ?? ''}`
}

function itemPrice(item: CartItem): number {
  return (item.variant?.price ?? item.product.price) + (item.addon?.price ?? 0)
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cc-baker-cart')
      if (saved) {
        const parsed = JSON.parse(saved) as CartItem[]
        const migrated = parsed.map(item => ({
          ...item,
          cartKey: item.cartKey || makeCartKey(item.product.id, item.variant?.label, item.addon?.label),
        }))
        setItems(migrated)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cc-baker-cart', JSON.stringify(items))
  }, [items])

  const addItem = (product: Product, variant?: ProductVariant, addon?: ProductAddon, qty = 1) => {
    const cartKey = makeCartKey(product.id, variant?.label, addon?.label)
    setItems(prev => {
      const existing = prev.find(i => i.cartKey === cartKey)
      if (existing) {
        return prev.map(i =>
          i.cartKey === cartKey ? { ...i, quantity: i.quantity + qty } : i
        )
      }
      return [...prev, { product, quantity: qty, variant, addon, cartKey }]
    })
  }

  const removeItem = (cartKey: string) => {
    setItems(prev => prev.filter(i => i.cartKey !== cartKey))
  }

  const updateQuantity = (cartKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartKey)
      return
    }
    setItems(prev =>
      prev.map(i => (i.cartKey === cartKey ? { ...i, quantity } : i))
    )
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + itemPrice(i) * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
