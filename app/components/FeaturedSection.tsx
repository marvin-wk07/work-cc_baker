'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProductCard from './ProductCard'
import { subscribeFirestoreProducts } from '../lib/products'
import { Product } from '../data/products'

export default function FeaturedSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const unsub = subscribeFirestoreProducts(data => {
      setProducts(data.slice(0, 3))
      setLoaded(true)
    })
    return () => unsub()
  }, [])

  if (!loaded || products.length === 0) return null

  return (
    <section className="py-14 px-4 bg-orange-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-amber-700 text-xs font-semibold tracking-widest uppercase mb-1">Today&apos;s Picks</p>
            <h2 className="text-2xl font-bold text-stone-800">今日精選</h2>
          </div>
          <Link href="/menu" className="text-sm text-amber-700 hover:text-amber-900 font-medium transition-colors">
            查看全部 →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
