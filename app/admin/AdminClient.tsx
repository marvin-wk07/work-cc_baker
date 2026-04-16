'use client'

import { useState, useEffect } from 'react'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { subscribeOrders, updateOrderStatus, Order, OrderStatus } from '../lib/orders'

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: '待確認',
  confirmed: '已確認',
  ready: '可取貨',
  completed: '已完成',
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
  completed: 'bg-stone-100 text-stone-500',
}

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  pending: 'confirmed',
  confirmed: 'ready',
  ready: 'completed',
  completed: null,
}

const NEXT_LABEL: Record<OrderStatus, string> = {
  pending: '確認訂單',
  confirmed: '通知取貨',
  ready: '完成',
  completed: '',
}

// ── Login Form ──────────────────────────────────────────────

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError('Email 或密碼錯誤')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🍞</div>
          <h1 className="text-xl font-bold text-stone-800">CC Baker 管理後台</h1>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 bg-white placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">密碼</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 bg-white placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-800 hover:bg-amber-700 disabled:bg-amber-300 text-white font-bold py-3 rounded-xl transition-colors"
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Orders Dashboard ────────────────────────────────────────

function Dashboard({ user }: { user: User }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')

  useEffect(() => {
    const unsub = subscribeOrders(data => {
      setOrders(data)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
  }

  const handleNextStatus = async (order: Order) => {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    await updateOrderStatus(order.id, next)
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-amber-950 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg">
          <span>🍞</span>
          <span>CC Baker 管理後台</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-amber-300">{user.email}</span>
          <button
            onClick={() => signOut(auth)}
            className="bg-amber-800 hover:bg-amber-700 px-3 py-1.5 rounded-full transition-colors"
          >
            登出
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {(['all', 'pending', 'confirmed', 'ready'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`bg-white rounded-xl p-4 text-center border transition-all ${
                filter === s ? 'border-amber-400 shadow-sm' : 'border-amber-100 hover:border-amber-200'
              }`}
            >
              <div className="text-2xl font-bold text-amber-900">{counts[s]}</div>
              <div className="text-xs text-stone-500 mt-0.5">
                {s === 'all' ? '全部訂單' : STATUS_LABEL[s]}
              </div>
            </button>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {(['all', 'pending', 'confirmed', 'ready', 'completed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === s
                  ? 'bg-amber-800 text-white'
                  : 'bg-white text-stone-600 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              {s === 'all' ? '全部' : STATUS_LABEL[s]}
              {s !== 'all' && counts[s] > 0 && (
                <span className="ml-1.5 bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5 rounded-full">
                  {counts[s]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-16 text-stone-400">載入中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-stone-400">沒有訂單</div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(order => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-stone-800">{order.name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status]}`}
                      >
                        {STATUS_LABEL[order.status]}
                      </span>
                    </div>
                    <div className="text-sm text-stone-500 flex gap-3 flex-wrap">
                      <span>📞 {order.phone}</span>
                      <span>📅 取貨：{order.date}</span>
                      {order.createdAt && (
                        <span>
                          🕐{' '}
                          {new Date(order.createdAt.seconds * 1000).toLocaleString('zh-HK', {
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-amber-900 text-lg">NT$ {order.totalPrice}</div>
                    {NEXT_STATUS[order.status] && (
                      <button
                        onClick={() => handleNextStatus(order)}
                        className="mt-1 text-xs bg-amber-800 hover:bg-amber-700 text-white px-3 py-1.5 rounded-full transition-colors"
                      >
                        {NEXT_LABEL[order.status]}
                      </button>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-amber-50 pt-3">
                  <ul className="flex flex-col gap-1">
                    {order.items.map((item, i) => (
                      <li key={i} className="flex justify-between text-sm">
                        <span className="text-stone-700">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="text-stone-500">NT$ {item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  {order.note && (
                    <p className="mt-2 text-xs text-stone-400 bg-stone-50 rounded-lg px-3 py-2">
                      備註：{order.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────

export default function AdminClient() {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setChecking(false)
    })
    return () => unsub()
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center text-stone-400">
        載入中...
      </div>
    )
  }

  if (!user) return <LoginForm />
  return <Dashboard user={user} />
}
