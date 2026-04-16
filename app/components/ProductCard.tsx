'use client'

import { useCart } from '../context/CartContext'
import { Product } from '../data/products'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, items } = useCart()
  const [added, setAdded] = useState(false)

  const cartItem = items.find(i => i.product.id === product.id)
  const quantity = cartItem?.quantity ?? 0

  const handleAdd = () => {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div
        className="h-32 flex items-center justify-center text-6xl"
        style={{ backgroundColor: product.bgColor }}
      >
        {product.icon}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-stone-800 text-sm leading-tight">{product.name}</h3>
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
            {product.category}
          </span>
        </div>
        <p className="text-xs text-stone-500 leading-relaxed flex-1 mb-3">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-amber-800 text-base">NT$ {product.price}</span>
          <button
            onClick={handleAdd}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-amber-800 hover:bg-amber-700 text-white'
            }`}
          >
            {added ? '已加入 ✓' : quantity > 0 ? `加入 (${quantity})` : '加入購物車'}
          </button>
        </div>
      </div>
    </div>
  )
}
