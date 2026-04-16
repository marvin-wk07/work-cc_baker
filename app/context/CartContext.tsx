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
  totalCapacity: number  // 購物車總製作能量
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
    const minQty = product.minQty ?? 1
    const maxQty = product.maxQty
    setItems(prev => {
      const existing = prev.find(i => i.cartKey === cartKey)
      if (existing) {
        const newQty = maxQty ? Math.min(existing.quantity + qty, maxQty) : existing.quantity + qty
        return prev.map(i =>
          i.cartKey === cartKey ? { ...i, quantity: newQty } : i
        )
      }
      const initialQty = maxQty
        ? Math.min(Math.max(qty, minQty), maxQty)
        : Math.max(qty, minQty)
      return [...prev, { product, quantity: initialQty, variant, addon, cartKey }]
    })
  }

  const removeItem = (cartKey: string) => {
    setItems(prev => prev.filter(i => i.cartKey !== cartKey))
  }

  const updateQuantity = (cartKey: string, quantity: number) => {
    setItems(prev => {
      const item = prev.find(i => i.cartKey === cartKey)
      if (!item) return prev
      const minQty = item.product.minQty ?? 1
      const maxQty = item.product.maxQty
      // Clicking below minQty (or 0) removes the item
      if (quantity <= 0 || quantity < minQty) {
        return prev.filter(i => i.cartKey !== cartKey)
      }
      const clampedQty = maxQty ? Math.min(quantity, maxQty) : quantity
      return prev.map(i => i.cartKey === cartKey ? { ...i, quantity: clampedQty } : i)
    })
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + itemPrice(i) * i.quantity, 0)
  const totalCapacity = items.reduce((sum, i) => sum + (i.product.capacity ?? 1) * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, totalCapacity }}
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
