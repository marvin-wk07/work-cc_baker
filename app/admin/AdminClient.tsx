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
import {
  subscribeShippingDates,
  addShippingDate,
  updateShippingDate,
  deleteShippingDate,
  formatShippingDate,
  ShippingDate,
} from '../lib/shippingDates'
import { Product, categories } from '../data/products'

// ── Constants ────────────────────────────────────────────────

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: '待確認', confirmed: '已確認', ready: '可出貨', completed: '已完成', cancelled: '已取消',
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
  pending: '確認訂單', confirmed: '通知出貨', ready: '完成',
}

const ICON_OPTIONS = ['🍞', '🥐', '🥯', '🍥', '🫓', '🧁', '🍰', '🥖', '🥟', '🌿']
const DEFAULT_COLORS = [
  '#FEF9C3', '#FEF3C7', '#FFF7ED', '#FFF1F2',
  '#F0FDF4', '#F5F5F4', '#FEFCE8', '#EDE9FE', '#F5F0FF', '#E7E5E4',
]

type VariantInput = { label: string; price: string }
type AddonInput  = { label: string; price: string }
type FormData = {
  name: string; description: string; price: string; category: string
  icon: string; bgColor: string; variants: VariantInput[]; addons: AddonInput[]
  minQty: string; maxQty: string; capacity: string
}
const EMPTY_FORM: FormData = { name: '', description: '', price: '', category: '歐式麵包', icon: '🍞', bgColor: '#FEF3C7', variants: [], addons: [], minQty: '', maxQty: '', capacity: '' }

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
                    <span>📅 出貨：{order.date}</span>
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
  initial: FormData
  onSave: (data: FormData) => Promise<void>
  onCancel: () => void
  saveLabel: string
}) {
  const [form, setForm] = useState<FormData>(initial)
  const [saving, setSaving] = useState(false)

  const f = (key: keyof Omit<FormData, 'variants'>) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  const addVariant = () =>
    setForm(prev => ({ ...prev, variants: [...prev.variants, { label: '', price: '' }] }))
  const removeVariant = (i: number) =>
    setForm(prev => ({ ...prev, variants: prev.variants.filter((_, idx) => idx !== i) }))
  const updateVariant = (i: number, key: keyof VariantInput, value: string) =>
    setForm(prev => ({ ...prev, variants: prev.variants.map((v, idx) => idx === i ? { ...v, [key]: value } : v) }))

  const addAddon = () =>
    setForm(prev => ({ ...prev, addons: [...prev.addons, { label: '', price: '' }] }))
  const removeAddon = (i: number) =>
    setForm(prev => ({ ...prev, addons: prev.addons.filter((_, idx) => idx !== i) }))
  const updateAddon = (i: number, key: keyof AddonInput, value: string) =>
    setForm(prev => ({ ...prev, addons: prev.addons.map((a, idx) => idx === i ? { ...a, [key]: value } : a) }))

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

      {/* Variants */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-stone-600">規格選項（選填）</label>
          <button type="button" onClick={addVariant}
            className="text-xs text-amber-700 hover:text-amber-900 font-medium transition-colors">
            ＋ 新增規格
          </button>
        </div>
        {form.variants.length > 0 && (
          <div className="flex flex-col gap-2">
            {form.variants.map((v, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" value={v.label} placeholder="例：9顆 / 整條" onChange={e => updateVariant(i, 'label', e.target.value)}
                  className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 bg-white placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition" />
                <input type="number" value={v.price} placeholder="價格" min={1} onChange={e => updateVariant(i, 'price', e.target.value)}
                  className="w-24 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 bg-white placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition" />
                <button type="button" onClick={() => removeVariant(i)}
                  className="text-stone-400 hover:text-red-400 text-xl leading-none transition-colors">×</button>
              </div>
            ))}
          </div>
        )}
        {form.variants.length === 0 && (
          <p className="text-xs text-stone-400">不設規格則以上方統一價格販售</p>
        )}
      </div>

      {/* Addons */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-stone-600">內餡選項（選填）</label>
          <button type="button" onClick={addAddon}
            className="text-xs text-amber-700 hover:text-amber-900 font-medium transition-colors">
            ＋ 新增內餡
          </button>
        </div>
        {form.addons.length > 0 ? (
          <div className="flex flex-col gap-2">
            {form.addons.map((a, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" value={a.label} placeholder="例：紅豆 / 芋頭" onChange={e => updateAddon(i, 'label', e.target.value)}
                  className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 bg-white placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition" />
                <input type="number" value={a.price} placeholder="加價" min={0} onChange={e => updateAddon(i, 'price', e.target.value)}
                  className="w-24 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 bg-white placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition" />
                <button type="button" onClick={() => removeAddon(i)}
                  className="text-stone-400 hover:text-red-400 text-xl leading-none transition-colors">×</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-400">不設內餡則不顯示加餡選項</p>
        )}
      </div>

      {/* Quantity Limits & Capacity */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">最少訂購數量（選填）</label>
          <input type="number" value={form.minQty} min={1} placeholder="預設 1"
            onChange={e => setForm(prev => ({ ...prev, minQty: e.target.value }))}
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 bg-white placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition" />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">最多訂購數量（選填）</label>
          <input type="number" value={form.maxQty} min={1} placeholder="不限"
            onChange={e => setForm(prev => ({ ...prev, maxQty: e.target.value }))}
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 bg-white placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition" />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">製作能量（選填）</label>
          <input type="number" value={form.capacity} min={1} placeholder="預設 10"
            onChange={e => setForm(prev => ({ ...prev, capacity: e.target.value }))}
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 bg-white placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition" />
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: form.bgColor }}>
          {form.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-stone-800 text-sm">{form.name || '商品名稱'}</p>
          {form.variants.length > 0 ? (
            <div className="flex gap-1 flex-wrap mt-0.5">
              {form.variants.filter(v => v.label).map((v, i) => (
                <span key={i} className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                  {v.label}{v.price ? `・NT$${v.price}` : ''}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-amber-700 text-sm font-semibold">NT$ {form.price || '0'}</p>
          )}
          {form.addons.filter(a => a.label).length > 0 && (
            <div className="flex gap-1 flex-wrap mt-0.5">
              {form.addons.filter(a => a.label).map((a, i) => (
                <span key={i} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                  加{a.label}{a.price ? `+$${a.price}` : ''}
                </span>
              ))}
            </div>
          )}
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')

  useEffect(() => {
    const unsub = subscribeFirestoreProducts(setProducts)
    return () => unsub()
  }, [])

  const parseForm = (form: FormData) => {
    const parsedVariants = form.variants
      .filter(v => v.label.trim() && v.price)
      .map(v => ({ label: v.label.trim(), price: Number(v.price) }))
    const parsedAddons = form.addons
      .filter(a => a.label.trim())
      .map(a => ({ label: a.label.trim(), price: Number(a.price) || 0 }))
    return {
      name: form.name, description: form.description, price: Number(form.price),
      category: form.category, icon: form.icon, bgColor: form.bgColor,
      variants: parsedVariants,
      addons: parsedAddons,
      minQty: form.minQty ? Number(form.minQty) : undefined,
      maxQty: form.maxQty ? Number(form.maxQty) : undefined,
      capacity: form.capacity ? Number(form.capacity) : undefined,
    }
  }

  const handleAdd = async (form: FormData) => {
    await addFirestoreProduct(parseForm(form))
    setShowAddForm(false)
  }

  const handleEdit = async (id: string, form: FormData) => {
    await updateFirestoreProduct(id, parseForm(form))
    setEditingId(null)
  }

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const selectAll = () =>
    setSelectedIds(
      selectedIds.size === products.length ? new Set() : new Set(products.map(p => p.id))
    )

  const handleBulkDelete = async () => {
    setBulkDeleting(true)
    try {
      await Promise.all([...selectedIds].map(id => deleteFirestoreProduct(id)))
      setSelectedIds(new Set())
      setConfirmBulkDelete(false)
    } finally {
      setBulkDeleting(false)
    }
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

  const editInitial = (p: Product): FormData => ({
    name: p.name,
    description: p.description,
    price: String(p.price),
    category: p.category,
    icon: p.icon,
    bgColor: p.bgColor,
    variants: p.variants?.map(v => ({ label: v.label, price: String(v.price) })) ?? [],
    addons: p.addons?.map(a => ({ label: a.label, price: String(a.price) })) ?? [],
    minQty: p.minQty !== undefined ? String(p.minQty) : '',
    maxQty: p.maxQty !== undefined ? String(p.maxQty) : '',
    capacity: p.capacity !== undefined ? String(p.capacity) : '',
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
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-bold text-stone-800">
            已上架商品
            {products.length > 0 && (
              <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-normal">{products.length} 項</span>
            )}
          </h3>
          <div className="flex gap-2 items-center flex-wrap">
            {products.length > 0 && (
              <button onClick={selectAll}
                className="text-xs text-stone-500 hover:text-stone-700 font-medium transition-colors border border-stone-200 px-3 py-1.5 rounded-full hover:bg-stone-50">
                {selectedIds.size === products.length ? '取消全選' : '全選'}
              </button>
            )}
            {selectedIds.size > 0 && !confirmBulkDelete && (
              <button onClick={() => setConfirmBulkDelete(true)}
                className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-full transition-colors font-medium">
                刪除選取 ({selectedIds.size})
              </button>
            )}
            {confirmBulkDelete && (
              <div className="flex gap-1 items-center">
                <span className="text-xs text-red-600 font-medium">確定刪除 {selectedIds.size} 項？</span>
                <button onClick={handleBulkDelete} disabled={bulkDeleting}
                  className="text-xs bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-1.5 rounded-full transition-colors">
                  {bulkDeleting ? '刪除中...' : '確認'}
                </button>
                <button onClick={() => setConfirmBulkDelete(false)}
                  className="text-xs bg-stone-200 text-stone-600 px-3 py-1.5 rounded-full">取消</button>
              </div>
            )}
            {products.length === 0 && (
              <button onClick={handleSeed} disabled={seeding}
                className="text-sm text-amber-700 hover:text-amber-900 font-medium transition-colors">
                {seeding ? '匯入中...' : '初始化菜單'}
              </button>
            )}
          </div>
        </div>

        {seedMsg && <p className="mb-3 text-sm text-stone-600 bg-amber-50 px-3 py-2 rounded-lg">{seedMsg}</p>}

        {products.length === 0 ? (
          <p className="text-stone-400 text-sm text-center py-6">尚未上架任何商品</p>
        ) : (
          <div className="flex flex-col gap-2">
            {products.map(product => (
              <div key={product.id}>
                <div className={`flex items-center gap-3 p-3 border rounded-xl transition-colors ${selectedIds.has(product.id) ? 'border-amber-300 bg-amber-50' : 'border-amber-50 hover:bg-amber-50'}`}>
                  <input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleSelect(product.id)}
                    className="w-4 h-4 rounded accent-amber-700 shrink-0 cursor-pointer" />
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

// ── Shipping Dates Tab ───────────────────────────────────────

function ShippingDatesTab() {
  const [dates, setDates] = useState<ShippingDate[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [addForm, setAddForm] = useState({ date: '', maxCapacity: '20', note: '' })
  const [editForm, setEditForm] = useState({ maxCapacity: '', note: '' })
  const [saving, setSaving] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const unsub = subscribeShippingDates(setDates)
    return () => unsub()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addForm.date || !addForm.maxCapacity) return
    setSaving(true)
    try {
      await addShippingDate({
        date: addForm.date,
        maxCapacity: Number(addForm.maxCapacity),
        note: addForm.note.trim(),
      })
      setAddForm({ date: '', maxCapacity: '20', note: '' })
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (d: ShippingDate) => {
    setEditingId(d.id)
    setEditForm({ maxCapacity: String(d.maxCapacity), note: d.note })
  }

  const handleEdit = async (id: string) => {
    setSaving(true)
    try {
      await updateShippingDate(id, { maxCapacity: Number(editForm.maxCapacity), note: editForm.note.trim() })
      setEditingId(null)
    } finally {
      setSaving(false)
    }
  }

  const upcoming = dates.filter(d => d.date >= today)
  const past = dates.filter(d => d.date < today)

  return (
    <div className="flex flex-col gap-6">
      {/* Add Form */}
      <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
        <h3 className="font-bold text-stone-800 mb-4">新增出貨日期</h3>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">日期 *</label>
              <input type="date" value={addForm.date} min={today}
                onChange={e => setAddForm(f => ({ ...f, date: e.target.value }))} required
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">最大製作能量 *</label>
              <input type="number" value={addForm.maxCapacity} min={1}
                onChange={e => setAddForm(f => ({ ...f, maxCapacity: e.target.value }))} required
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">備註（選填，例：限量預購）</label>
            <input type="text" value={addForm.note} placeholder="例：限量預購、父親節特供"
              onChange={e => setAddForm(f => ({ ...f, note: e.target.value }))}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 bg-white placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition" />
          </div>
          <button type="submit" disabled={saving}
            className="bg-amber-800 hover:bg-amber-700 disabled:bg-amber-300 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">
            {saving ? '新增中...' : '＋ 新增日期'}
          </button>
        </form>
      </div>

      {/* Upcoming Dates */}
      <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
        <h3 className="font-bold text-stone-800 mb-4">
          即將出貨
          {upcoming.length > 0 && <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-normal">{upcoming.length} 個日期</span>}
        </h3>
        {upcoming.length === 0 ? (
          <p className="text-stone-400 text-sm text-center py-6">尚未設定出貨日期</p>
        ) : (
          <div className="flex flex-col gap-2">
            {upcoming.map(d => {
              const remaining = d.maxCapacity - d.usedCapacity
              const isFull = remaining <= 0
              const pct = d.maxCapacity > 0 ? Math.min(100, (d.usedCapacity / d.maxCapacity) * 100) : 0
              return (
                <div key={d.id}>
                  <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${isFull ? 'border-red-100 bg-red-50' : 'border-amber-50 hover:bg-amber-50'}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-800 text-sm">{formatShippingDate(d.date)}</p>
                      {d.note && <p className="text-xs text-stone-400 mt-0.5">{d.note}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-stone-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isFull ? 'bg-red-400' : remaining <= d.maxCapacity * 0.2 ? 'bg-orange-400' : 'bg-green-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium shrink-0 ${isFull ? 'text-red-500' : remaining <= d.maxCapacity * 0.2 ? 'text-orange-500' : 'text-stone-500'}`}>
                          {d.usedCapacity} / {d.maxCapacity}{isFull ? '（已滿）' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => editingId === d.id ? setEditingId(null) : startEdit(d)}
                        className={`text-xs px-3 py-1.5 rounded-full transition-colors ${editingId === d.id ? 'bg-amber-200 text-amber-900' : 'bg-stone-100 hover:bg-amber-100 text-stone-600'}`}>
                        編輯
                      </button>
                      {confirmDelete === d.id ? (
                        <>
                          <button onClick={() => { deleteShippingDate(d.id); setConfirmDelete(null) }}
                            className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-full">確認</button>
                          <button onClick={() => setConfirmDelete(null)}
                            className="text-xs bg-stone-200 text-stone-600 px-3 py-1.5 rounded-full">取消</button>
                        </>
                      ) : (
                        <button onClick={() => setConfirmDelete(d.id)}
                          className="text-xs bg-stone-100 hover:bg-red-100 text-stone-500 hover:text-red-500 px-3 py-1.5 rounded-full transition-colors">
                          刪除
                        </button>
                      )}
                    </div>
                  </div>
                  {editingId === d.id && (
                    <div className="mt-2 p-4 border border-amber-200 rounded-xl bg-amber-50 flex gap-3 items-end">
                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">最大製作能量</label>
                        <input type="number" value={editForm.maxCapacity} min={d.usedCapacity || 1}
                          onChange={e => setEditForm(f => ({ ...f, maxCapacity: e.target.value }))}
                          className="w-24 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 bg-white focus:outline-none focus:border-amber-400 transition" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-stone-600 mb-1">備註</label>
                        <input type="text" value={editForm.note} placeholder="備註（選填）"
                          onChange={e => setEditForm(f => ({ ...f, note: e.target.value }))}
                          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 bg-white placeholder:text-stone-400 focus:outline-none focus:border-amber-400 transition" />
                      </div>
                      <button onClick={() => handleEdit(d.id)} disabled={saving}
                        className="bg-amber-800 hover:bg-amber-700 disabled:bg-amber-300 text-white font-bold px-4 py-2 rounded-xl transition-colors text-sm shrink-0">
                        儲存
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="bg-stone-100 text-stone-600 px-4 py-2 rounded-xl text-sm shrink-0">取消</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Past Dates */}
      {past.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm opacity-60">
          <h3 className="font-bold text-stone-500 mb-3 text-sm">過往日期</h3>
          <div className="flex flex-col gap-1">
            {past.slice(-5).reverse().map(d => (
              <div key={d.id} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm">
                <span className="text-stone-500">{formatShippingDate(d.date)}</span>
                <span className="text-xs text-stone-400">已用 {d.usedCapacity} / {d.maxCapacity}</span>
                <button onClick={() => deleteShippingDate(d.id)}
                  className="text-xs text-stone-400 hover:text-red-400 ml-2 transition-colors">刪除</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Dashboard ────────────────────────────────────────────────

function Dashboard({ user }: { user: User }) {
  const [tab, setTab] = useState<'orders' | 'products' | 'shipping'>('orders')
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
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['orders', 'products', 'shipping'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full font-medium text-sm transition-colors ${tab === t ? 'bg-amber-800 text-white shadow-sm' : 'bg-white text-stone-600 border border-amber-200 hover:bg-amber-50'}`}>
              {t === 'orders' ? '訂單管理' : t === 'products' ? '商品管理' : '出貨日期'}
            </button>
          ))}
        </div>
        {tab === 'orders' ? <OrdersTab /> : tab === 'products' ? <ProductsTab /> : <ShippingDatesTab />}
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
