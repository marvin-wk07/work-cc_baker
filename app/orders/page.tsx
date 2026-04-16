import type { Metadata } from 'next'
import OrdersClient from './OrdersClient'

export const metadata: Metadata = {
  title: '查詢訂單 — CC Baker',
  description: '輸入電話號碼查看您的訂單狀態',
}

export default function OrdersPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-amber-700 text-xs font-semibold tracking-widest uppercase mb-1">Order Lookup</p>
        <h1 className="text-3xl font-bold text-stone-800 mb-2">查詢訂單</h1>
        <p className="text-stone-500 text-sm">輸入下單時填寫的電話號碼，即可查看訂單狀態</p>
      </div>
      <OrdersClient />
    </div>
  )
}
