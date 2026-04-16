'use client'

import { useState, useEffect } from 'react'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { subscribeOrders, updateOrderStatus, deleteOrder, Order, OrderStatus } from '../lib/orders'
import {
  subscribeFirestoreProducts,
  addFirestoreProduct,
  updateFirestoreProduct,
  deleteFirestoreProduct,
  seedMenuProducts,
} from '../lib/products'
import { Product, categories } from '../data/products'

// ── Constants ────────────────────────────────────────────────

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
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'confirmed', confirmed: 'ready', ready: 'completed',
}
const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  pending: '確認訂單', confirmed: '通知取貨', ready: '完成',
}

const ICON_OPTIONS = ['🍞', '🥐', '🥯', '🍥', '🫓', '🧁', '🍰', '🥖', '🥟', '🌿']
const DEFAULT_COLORS = [
  '#FEF9C3', '#FEF3C7', '#FFF7ED', '#FFF1F2',
  '#F0FDF4', '#F5F5F4', '#FEFCE8', '#EDE9FE', '#F5F0FF', '#E7E5E4',
]

const EMPTY_FORM = { name: '', description: '', price: '', category: '歐式麵包', icon: '🍞', bgColor: '#FEF3C7' }

// ── Login ────────────────────────────────────────────────────

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
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 bg-white placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">密碼</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 bg-white placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition" />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="bg-amber-800 hover:bg-amber-700 disabled:bg-amber-300 text-white font-bold py-3 rounded-xl transition-colors">
            {loading ? '登入中...' : '登入'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Orders Tab ───────────────────────────────────────────────

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    const unsub = subscribeOrders(data => { setOrders(data); setLoading(false) })
    return () => unsub()
  }, [])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-5">
        {(['all', 'pending', 'confirmed', 'ready'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`bg-white rounded-xl p-3 text-center border transition-all ${filter === s ? 'border-amber-400 shadow-sm' : 'border-amber-100 hover:border-amber-200'}`}>
            <div className="text-2xl font-bold text-amber-900">{counts[s]}</div>
            <div className="text-xs text-stone-500 mt-0.5">{s === 'all' ? '全部' : STATUS_LABEL[s]}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {(['all', 'pending', 'confirmed', 'ready', 'completed', 'cancelled'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === s ? 'bg-amber-800 text-white' : 'bg-white text-stone-600 border border-amber-200 hover:bg-amber-50'}`}>
            {s === 'all' ? '全部' : STATUS_LABEL[s]}
            {s !== 'all' && counts[s] > 0 && (
              <span className="ml-1 bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5 rounded-full">{counts[s]}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-stone-400">載入中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400">沒有訂單</div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-stone-800">{order.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status]}`}>{STATUS_LABEL[order.status]}</span>
                  </div>
                  <div className="text-sm text-stone-500 flex gap-3 flex-wrap">
                    <span>📞 {order.phone}</span>
                    <span>📅 取貨：{order.date}</span>
                    {order.createdAt && (
                      <span>🕐 {new Date(order.createdAt.seconds * 1000).toLocaleString('zh-HK', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-amber-900 text-lg">NT$ {order.totalPrice}</div>
                  <div className="flex gap-2 mt-1 justify-end flex-wrap">
                    {NEXT_STATUS[order.status] && (
                      <button onClick={() => updateOrderStatus(order.id, NEXT_STATUS[order.status]!)}
                        className="text-xs bg-amber-800 hover:bg-amber-700 text-white px-3 py-1.5 rounded-full transition-colors">
                        {NEXT_LABEL[order.status]}
                      </button>
                    )}
                    {order.status !== 'cancelled' && order.status !== 'completed' && (
                      <button onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1.5 rounded-full transition-colors">
                        取消
                      </button>
                    )}
                    {confirmDelete === order.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => { deleteOrder(order.id); setConfirmDelete(null) }}
                          className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-full">確認刪除</button>
                        <button onClick={() => setConfirmDelete(null)}
                          className="text-xs bg-stone-200 text-stone-600 px-3 py-1.5 rounded-full">取消</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(order.id)}
                        className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-500 px-3 py-1.5 rounded-full transition-colors">
                        刪除
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="border-t border-amber-50 pt-3">
                <ul className="flex flex-col gap-1">
                  {order.items.map((item, i) => (
                    <li key={i} className="flex justify-between text-sm">
                      <span className="text-stone-700">{item.name} × {item.quantity}</span>
                      <span className="text-stone-500">NT$ {item.price * item.quantity}</span>
                    </li>
                  ))}
                </ul>
                {order.note && <p className="mt-2 text-xs text-stone-400 bg-stone-50 rounded-lg px-3 py-2">備註：{order.note}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Product Form (shared for add & edit) ─────────────────────

function ProductForm({
  initial,
  onSave,
  onCancel,
  saveLabel,
}: {
  initial: typeof EMPTY_FORM
  onSave: (data: typeof EMPTY_FORM) => Promise<void>
  onCancel: () => void
  saveLabel: string
}) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)

  const f = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.price) return
    setSaving(true)
    try { await onSave(form) } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">商品名稱 *</label>
          <input type="text" value={form.name} onChange={f('name')} placeholder="例：杏仁可頌" required
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 bg-white placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition" />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">價格 (NT$) *</label>
          <input type="number" value={form.price} onChange={f('price')} placeholder="65" min={1} required
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 bg-white placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">商品描述</label>
        <input type="text" value={form.description} onChange={f('description')} placeholder="簡短描述商品特色..."
          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 bg-white placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition" />
      </div>
      <div className="grid grid-cols-3 gap-3 items-start">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">分類</label>
          <select value={form.category} onChange={f('category')}
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition">
            {categories.filter(c => c !== '全部').map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">圖示</label>
          <div className="flex flex-wrap gap-1">
            {ICON_OPTIONS.map(icon => (
              <button key={icon} type="button" onClick={() => setForm(f => ({ ...f, icon }))}
                className={`w-8 h-8 text-lg rounded-lg flex items-center justify-center transition-colors ${form.icon === icon ? 'bg-amber-200 ring-2 ring-amber-400' : 'bg-stone-100 hover:bg-amber-100'}`}>
                {icon}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">背景色</label>
          <div className="flex flex-wrap gap-1">
            {DEFAULT_COLORS.map(color => (
              <button key={color} type="button" onClick={() => setForm(f => ({ ...f, bgColor: color }))}
                className={`w-8 h-8 rounded-lg border-2 transition-all ${form.bgColor === color ? 'border-amber-500 scale-110' : 'border-transparent hover:border-amber-300'}`}
                style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: form.bgColor }}>
          {form.icon}
        </div>
        <div>
          <p className="font-medium text-stone-800 text-sm">{form.name || '商品名稱'}</p>
          <p className="text-amber-700 text-sm font-semibold">NT$ {form.price || '0'}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={saving}
          className="flex-1 bg-amber-800 hover:bg-amber-700 disabled:bg-amber-300 text-white font-bold py-2.5 rounded-xl transition-colors">
          {saving ? '儲存中...' : saveLabel}
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium py-2.5 rounded-xl transition-colors">
          取消
        </button>
      </div>
    </form>
  )
}

// ── Products Tab ─────────────────────────────────────────────

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')

  useEffect(() => {
    const unsub = subscribeFirestoreProducts(setProducts)
    return () => unsub()
  }, [])

  const handleAdd = async (form: typeof EMPTY_FORM) => {
    await addFirestoreProduct({ ...form, price: Number(form.price) })
    setShowAddForm(false)
  }

  const handleEdit = async (id: string, form: typeof EMPTY_FORM) => {
    await updateFirestoreProduct(id, { ...form, price: Number(form.price) })
    setEditingId(null)
  }

  const handleSeed = async () => {
    setSeeding(true)
    setSeedMsg('')
    try {
      const count = await seedMenuProducts()
      setSeedMsg(count > 0 ? `✅ 已成功匯入 ${count} 種商品` : '⚠️ 資料庫已有商品，略過初始化')
    } catch {
      setSeedMsg('❌ 初始化失敗，請稍後再試')
    } finally {
      setSeeding(false)
    }
  }

  const editInitial = (p: Product): typeof EMPTY_FORM => ({
    name: p.name,
    description: p.description,
    price: String(p.price),
    category: p.category,
    icon: p.icon,
    bgColor: p.bgColor,
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Seed Button */}
      {products.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="text-sm font-medium text-amber-900 mb-1">首次使用？</p>
          <p className="text-sm text-stone-500 mb-4">一鍵將菜單上的 {42} 種商品匯入資料庫，之後可自由編輯。</p>
          <button onClick={handleSeed} disabled={seeding}
            className="bg-amber-800 hover:bg-amber-700 disabled:bg-amber-300 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">
            {seeding ? '匯入中...' : '🚀 初始化菜單商品'}
          </button>
          {seedMsg && <p className="mt-3 text-sm text-stone-600">{seedMsg}</p>}
        </div>
      )}

      {/* Add Product */}
      <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-stone-800">新增商品</h3>
          {!showAddForm && (
            <button onClick={() => setShowAddForm(true)}
              className="text-sm bg-amber-800 hover:bg-amber-700 text-white px-4 py-1.5 rounded-full transition-colors">
              + 新增
            </button>
          )}
        </div>
        {showAddForm && (
          <ProductForm
            initial={EMPTY_FORM}
            onSave={handleAdd}
            onCancel={() => setShowAddForm(false)}
            saveLabel="上架商品"
          />
        )}
      </div>

      {/* Products List */}
      <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-stone-800">
            已上架商品
            {products.length > 0 && (
              <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-normal">{products.length} 項</span>
            )}
          </h3>
          {products.length === 0 && (
            <button onClick={handleSeed} disabled={seeding}
              className="text-sm text-amber-700 hover:text-amber-900 font-medium transition-colors">
              {seeding ? '匯入中...' : '初始化菜單'}
            </button>
          )}
        </div>

        {seedMsg && <p className="mb-3 text-sm text-stone-600 bg-amber-50 px-3 py-2 rounded-lg">{seedMsg}</p>}

        {products.length === 0 ? (
          <p className="text-stone-400 text-sm text-center py-6">尚未上架任何商品</p>
        ) : (
          <div className="flex flex-col gap-2">
            {products.map(product => (
              <div key={product.id}>
                <div className="flex items-center gap-3 p-3 border border-amber-50 rounded-xl hover:bg-amber-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: product.bgColor }}>
                    {product.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-800 text-sm truncate">{product.name}</p>
                    <p className="text-xs text-stone-400">{product.category} · NT$ {product.price}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setEditingId(editingId === product.id ? null : product.id)}
                      className={`text-xs px-3 py-1.5 rounded-full transition-colors ${editingId === product.id ? 'bg-amber-200 text-amber-900' : 'bg-stone-100 hover:bg-amber-100 text-stone-600'}`}>
                      編輯
                    </button>
                    {confirmDelete === product.id ? (
                      <>
                        <button onClick={() => { deleteFirestoreProduct(product.id); setConfirmDelete(null) }}
                          className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-full">確認</button>
                        <button onClick={() => setConfirmDelete(null)}
                          className="text-xs bg-stone-200 text-stone-600 px-3 py-1.5 rounded-full">取消</button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmDelete(product.id)}
                        className="text-xs bg-stone-100 hover:bg-red-100 text-stone-500 hover:text-red-500 px-3 py-1.5 rounded-full transition-colors">
                        下架
                      </button>
                    )}
                  </div>
                </div>
                {/* Inline Edit Form */}
                {editingId === product.id && (
                  <div className="mt-2 p-4 border border-amber-200 rounded-xl bg-amber-50">
                    <ProductForm
                      initial={editInitial(product)}
                      onSave={(form) => handleEdit(product.id, form)}
                      onCancel={() => setEditingId(null)}
                      saveLabel="儲存變更"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Dashboard ────────────────────────────────────────────────

function Dashboard({ user }: { user: User }) {
  const [tab, setTab] = useState<'orders' | 'products'>('orders')
  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-amber-950 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg">
          <span>🍞</span><span>CC Baker 管理後台</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-amber-300 hidden sm:block">{user.email}</span>
          <button onClick={() => signOut(auth)} className="bg-amber-800 hover:bg-amber-700 px-3 py-1.5 rounded-full transition-colors">登出</button>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          {(['orders', 'products'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full font-medium text-sm transition-colors ${tab === t ? 'bg-amber-800 text-white shadow-sm' : 'bg-white text-stone-600 border border-amber-200 hover:bg-amber-50'}`}>
              {t === 'orders' ? '訂單管理' : '商品管理'}
            </button>
          ))}
        </div>
        {tab === 'orders' ? <OrdersTab /> : <ProductsTab />}
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────

export default function AdminClient() {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { setUser(u); setChecking(false) })
    return () => unsub()
  }, [])

  if (checking) return <div className="min-h-screen bg-amber-50 flex items-center justify-center text-stone-400">載入中...</div>
  if (!user) return <LoginForm />
  return <Dashboard user={user} />
}
