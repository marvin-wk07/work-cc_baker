'use client'

import Link from 'next/link'
import { useCart } from '../context/CartContext'

export default function CartButton() {
  const { totalItems } = useCart()

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-2 bg-amber-700 hover:bg-amber-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
    >
      <span>🛒</span>
      <span>購物車</span>
      {totalItems > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </Link>
  )
}
