import type { Metadata } from 'next'
import CartClient from './CartClient'

export const metadata: Metadata = {
  title: '購物車 — CC Baker',
  description: '查看您的購物車並完成訂單',
}

export default function CartPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-amber-700 text-xs font-semibold tracking-widest uppercase mb-1">Cart</p>
        <h1 className="text-3xl font-bold text-stone-800">購物車</h1>
      </div>
      <CartClient />
    </div>
  )
}
