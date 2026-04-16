'use client'

import { useCart } from '../context/CartContext'
import { Product } from '../data/products'
import { useState } from 'react'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addItem(product)
    setAdded(true)
    setQty(1)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div
        className="h-28 flex items-center justify-center text-5xl"
        style={{ backgroundColor: product.bgColor }}
      >
        {product.icon}
      </div>
      <div className="p-3 flex flex-col flex-1 gap-2">
        <div className="flex items-start justify-between gap-1">
          <h3 className="font-semibold text-stone-800 text-sm leading-tight">{product.name}</h3>
          <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
            {product.category}
          </span>
        </div>
        <p className="text-xs text-stone-500 leading-relaxed flex-1">{product.description}</p>
        <div className="font-bold text-amber-800 text-sm">NT$ {product.price}</div>

        {/* Quantity + Add */}
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1 border border-amber-200 rounded-full overflow-hidden">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-amber-50 transition-colors font-bold"
            >
              −
            </button>
            <span className="w-5 text-center text-sm font-medium text-stone-800">{qty}</span>
            <button
              onClick={() => setQty(q => q + 1)}
              className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-amber-50 transition-colors font-bold"
            >
              +
            </button>
          </div>
          <button
            onClick={handleAdd}
            className={`flex-1 text-xs py-1.5 rounded-full font-medium transition-all ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-amber-800 hover:bg-amber-700 text-white'
            }`}
          >
            {added ? '已加入 ✓' : '加入購物車'}
          </button>
        </div>
      </div>
    </div>
  )
}
