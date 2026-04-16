'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { defaultProducts, categories } from '../data/products'
import { subscribeFirestoreProducts } from '../lib/products'
import { Product } from '../data/products'
import ProductCard from '../components/ProductCard'

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export default function MenuClient() {
  const [view, setView] = useState<'shop' | 'image'>('shop')
  const [activeCategory, setActiveCategory] = useState('全部')
  const [firestoreProducts, setFirestoreProducts] = useState<Product[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const unsub = subscribeFirestoreProducts(data => {
      setFirestoreProducts(data)
      setLoaded(true)
    })
    return () => unsub()
  }, [])

  const allProducts = loaded && firestoreProducts.length > 0
    ? firestoreProducts
    : defaultProducts

  const filtered =
    activeCategory === '全部'
      ? allProducts
      : allProducts.filter(p => p.category === activeCategory)

  // Group by category for the shop view
  const groupedCategories = categories.filter(c => c !== '全部').filter(cat =>
    filtered.some(p => p.category === cat)
  )

  return (
    <div>
      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView('shop')}
          className={`px-5 py-2 rounded-full font-medium text-sm transition-colors ${
            view === 'shop'
              ? 'bg-amber-400 text-white shadow-sm'
              : 'bg-white text-stone-600 border border-amber-200 hover:bg-orange-200'
          }`}
        >
          🛍️ 選購商品
        </button>
        <button
          onClick={() => setView('image')}
          className={`px-5 py-2 rounded-full font-medium text-sm transition-colors ${
            view === 'image'
              ? 'bg-amber-400 text-white shadow-sm'
              : 'bg-white text-stone-600 border border-amber-200 hover:bg-orange-200'
          }`}
        >
          📋 完整菜單圖
        </button>
      </div>

      {view === 'image' ? (
        /* ── Menu Images ── */
        <div className="flex flex-col gap-6">
          <p className="text-sm text-stone-500">點擊圖片可放大查看完整菜單</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['/menu-p1.jpg', '/menu-p2.jpg'].map((src, i) => (
              <a key={src} href={`${BASE_PATH}${src}`} target="_blank" rel="noopener noreferrer" className="block rounded-2xl overflow-hidden border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                <Image
                  src={`${BASE_PATH}${src}`}
                  alt={`菜單第 ${i + 1} 頁`}
                  width={600}
                  height={800}
                  className="w-full h-auto"
                />
              </a>
            ))}
          </div>
        </div>
      ) : (
        /* ── Shop View ── */
        <div>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8 sticky top-[57px] bg-orange-200 py-3 z-10 -mx-4 px-4 border-b border-amber-100">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-amber-400 text-white shadow-sm'
                    : 'bg-white text-stone-600 hover:bg-orange-200 border border-amber-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products — grouped by category if showing all */}
          {activeCategory === '全部' ? (
            <div className="flex flex-col gap-10">
              {groupedCategories.map(cat => {
                const catProducts = filtered.filter(p => p.category === cat)
                if (catProducts.length === 0) return null
                return (
                  <section key={cat}>
                    <h2 className="text-base font-bold text-stone-700 mb-4 flex items-center gap-2">
                      <span className="w-1 h-5 bg-rose-300 rounded-full inline-block" />
                      {cat}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {catProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <p className="text-center text-stone-400 py-16">此分類暫無商品</p>
          )}
        </div>
      )}
    </div>
  )
}
