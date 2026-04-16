'use client'

import { useState } from 'react'
import { products, categories } from '../data/products'
import ProductCard from '../components/ProductCard'

export default function MenuClient() {
  const [activeCategory, setActiveCategory] = useState('全部')

  const filtered =
    activeCategory === '全部'
      ? products
      : products.filter(p => p.category === activeCategory)

  return (
    <div>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-amber-800 text-white shadow-sm'
                : 'bg-white text-stone-600 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-stone-400 py-16">此分類暫無商品</p>
      )}
    </div>
  )
}
