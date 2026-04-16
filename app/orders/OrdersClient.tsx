'use client'

import { useState } from 'react'
import { getOrdersByPhone, Order, OrderStatus } from '../lib/orders'

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: '待確認', confirmed: '已確認', ready: '可取貨', completed: '已完成', cancelled: '已取消',
}
const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
  completed: 'bg-stone-100 text-stone-500',
  cancelled: 'bg-red-100 text-red-500',
}
const STATUS_ICON: Record<OrderStatus, string> = {
  pending: '⏳', confirmed: '✅', ready: '🛍️', completed: '🎉', cancelled: '❌',
}

export default function OrdersClient() {
  const [phone, setPhone] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) return
    setLoading(true)
    setError('')
    setSearched(false)
    try {
      const result = await getOrdersByPhone(phone)
      setOrders(result)
      setSearched(true)
    } catch {
      setError('查詢失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Search Form */}
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="請輸入電話號碼，例：0912345678"
            className="flex-1 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 bg-white placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
          />
          <button
            type="submit"
            disabled={loading || !phone.trim()}
            className="bg-amber-800 hover:bg-amber-700 disabled:bg-amber-300 text-white font-bold px-5 py-3 rounded-xl transition-colors text-sm whitespace-nowrap"
          >
            {loading ? '查詢中...' : '查詢'}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </div>

      {/* Results */}
      {searched && (
        orders.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm">找不到此電話號碼的訂單</p>
            <p className="text-xs mt-1">請確認號碼是否正確，或重新下單</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-stone-500">共找到 <span className="font-medium text-stone-800">{orders.length}</span> 筆訂單</p>
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
                {/* Status bar */}
                <div className={`px-5 py-2 flex items-center gap-2 text-sm font-medium ${STATUS_COLOR[order.status]}`}>
                  <span>{STATUS_ICON[order.status]}</span>
                  <span>{STATUS_LABEL[order.status]}</span>
                  {order.status === 'ready' && (
                    <span className="ml-auto text-xs font-normal">請盡快取貨！</span>
                  )}
                </div>

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="font-bold text-stone-800">{order.name}</p>
                      <div className="flex gap-3 text-xs text-stone-400 mt-1 flex-wrap">
                        <span>📅 出貨：{order.date}</span>
                        {order.createdAt && (
                          <span>🕐 下單：{new Date(order.createdAt.seconds * 1000).toLocaleString('zh-TW', {
                            month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-amber-900 text-lg">NT$ {order.totalPrice}</div>
                    </div>
                  </div>

                  {/* Items */}
                  <ul className="flex flex-col gap-1 border-t border-amber-50 pt-3">
                    {order.items.map((item, i) => (
                      <li key={i} className="flex justify-between text-sm">
                        <span className="text-stone-700">{item.name} × {item.quantity}</span>
                        <span className="text-stone-400">NT$ {item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>

                  {order.note && (
                    <p className="mt-3 text-xs text-stone-400 bg-stone-50 rounded-lg px-3 py-2">
                      備註：{order.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
