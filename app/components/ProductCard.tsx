'use client'

import { useCart } from '../context/CartContext'
import { Product, ProductVariant, ProductAddon } from '../data/products'
import { useState } from 'react'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const hasVariants = product.variants && product.variants.length > 0
  const hasAddons = product.addons && product.addons.length > 0

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    hasVariants ? product.variants![0] : undefined
  )
  const [selectedAddon, setSelectedAddon] = useState<ProductAddon | undefined>(undefined)
  const minQty = product.minQty ?? 1
  const maxQty = product.maxQty
  const capacity = product.capacity ?? 10

  const [qty, setQty] = useState(minQty)
  const [added, setAdded] = useState(false)

  const basePrice = selectedVariant?.price ?? product.price
  const addonPrice = selectedAddon?.price ?? 0
  const unitPrice = basePrice + addonPrice
  const totalCapacity = capacity * qty

  const handleAdd = () => {
    addItem(product, selectedVariant, selectedAddon, qty)
    setAdded(true)
    setQty(minQty)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div
        className="h-28 flex items-center justify-center text-5xl"
        style={{ backgroundColor: product.bgColor }}
      >
        {product.icon}
      </div>
      <div className="p-3 flex flex-col flex-1 gap-2">
        <div className="flex items-start justify-between gap-1">
          <h3 className="font-semibold text-stone-800 text-sm leading-tight">{product.name}</h3>
          <span className="text-xs bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
            {product.category}
          </span>
        </div>
        <p className="text-xs text-stone-500 leading-relaxed flex-1">{product.description}</p>

        {/* Variant selector */}
        {hasVariants && (
          <div className="flex gap-1 flex-wrap">
            {product.variants!.map(v => (
              <button
                key={v.label}
                onClick={() => setSelectedVariant(v)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                  selectedVariant?.label === v.label
                    ? 'bg-rose-400 text-white'
                    : 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                {v.label}・NT${v.price}
              </button>
            ))}
          </div>
        )}

        {/* Addon selector */}
        {hasAddons && (
          <div>
            <p className="text-xs text-stone-400 mb-1">加內餡 <span className="text-rose-400">(+NT${product.addons![0].price})</span></p>
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setSelectedAddon(undefined)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                  !selectedAddon
                    ? 'bg-stone-700 text-white'
                    : 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200'
                }`}
              >
                原味
              </button>
              {product.addons!.map(a => (
                <button
                  key={a.label}
                  onClick={() => setSelectedAddon(a)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                    selectedAddon?.label === a.label
                      ? 'bg-stone-700 text-white'
                      : 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price + Capacity */}
        <div className="flex items-center justify-between gap-1">
          {!hasVariants && (
            <div className="font-bold text-rose-500 text-sm">
              NT$ {unitPrice}
              {addonPrice > 0 && (
                <span className="text-xs font-normal text-stone-400 ml-1">
                  ({product.price} + {addonPrice})
                </span>
              )}
            </div>
          )}
          {hasVariants && <div />}
          <span className="text-xs text-stone-400 shrink-0">
            製作能量 <span className="font-medium text-stone-500">{capacity}</span>
          </span>
        </div>

        {/* Quantity + Add */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-rose-200 rounded-full overflow-hidden">
            <button
              onClick={() => setQty(q => Math.max(minQty, q - 1))}
              disabled={qty <= minQty}
              className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-rose-50 transition-colors font-bold disabled:opacity-30 disabled:cursor-not-allowed"
            >
              −
            </button>
            <span className="w-5 text-center text-sm font-medium text-stone-800">{qty}</span>
            <button
              onClick={() => setQty(q => q + 1)}
              disabled={maxQty !== undefined && qty >= maxQty}
              className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-rose-50 transition-colors font-bold disabled:opacity-30 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
          {/* Running capacity total when qty > 1 */}
          {qty > 1 && (
            <span className="text-xs text-stone-400 shrink-0">
              能量 <span className="font-semibold text-stone-500">{totalCapacity}</span>
            </span>
          )}
          <button
            onClick={handleAdd}
            className={`flex-1 text-xs py-1.5 rounded-full font-medium transition-all ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-rose-400 hover:bg-rose-300 text-white'
            }`}
          >
            {added ? '已加入 ✓' : `加入 NT$${unitPrice * qty}`}
          </button>
        </div>
        {maxQty !== undefined && (
          <p className="text-xs text-stone-400 text-right -mt-1">限購 {maxQty} 件</p>
        )}
      </div>
    </div>
  )
}
