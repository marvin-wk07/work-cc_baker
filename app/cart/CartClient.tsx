'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '../context/CartContext'
import { saveOrder } from '../lib/orders'

type FormData = {
  name: string
  phone: string
  date: string
  note: string
}

export default function CartClient() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart()
  const [form, setForm] = useState<FormData>({ name: '', phone: '', date: '', note: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const today = new Date().toISOString().split('T')[0]

  const validate = () => {
    const e: Partial<FormData> = {}
    if (!form.name.trim()) e.name = '請填寫姓名'
    if (!form.phone.trim()) e.phone = '請填寫電話'
    else if (!/^[0-9+\-\s]{8,15}$/.test(form.phone.trim())) e.phone = '請輸入有效電話號碼'
    if (!form.date) e.date = '請選擇取貨日期'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    try {
      await saveOrder({ ...form, items, totalPrice })
      clearCart()
      setSubmitted(true)
    } catch {
      alert('送出失敗，請稍後再試')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-bold text-stone-800 mb-3">訂單已收到！</h2>
        <p className="text-stone-500 mb-2">
          我們已收到您的訂單，將在取貨前一天以電話確認。
        </p>
        <p className="text-amber-700 font-medium mb-8">感謝您選擇 CC Baker 🍞</p>
        <Link
          href="/menu"
          className="inline-block bg-amber-800 hover:bg-amber-700 text-white font-medium px-8 py-3 rounded-full transition-colors"
        >
          繼續選購
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🛒</div>
        <p className="text-stone-500 mb-6 text-lg">購物車是空的</p>
        <Link
          href="/menu"
          className="inline-block bg-amber-800 hover:bg-amber-700 text-white font-medium px-8 py-3 rounded-full transition-colors"
        >
          去逛逛菜單
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Cart Items */}
      <section className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-amber-100 flex items-center justify-between">
          <h2 className="font-semibold text-stone-800">已選商品 ({totalItems} 件)</h2>
          <button
            onClick={clearCart}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            清空購物車
          </button>
        </div>
        <ul>
          {items.map(({ product, quantity }) => (
            <li
              key={product.id}
              className="flex items-center gap-4 px-5 py-4 border-b border-amber-50 last:border-b-0"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ backgroundColor: product.bgColor }}
              >
                {product.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-800 text-sm truncate">{product.name}</p>
                <p className="text-amber-700 text-sm font-semibold">NT$ {product.price}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-7 h-7 rounded-full bg-amber-100 hover:bg-amber-200 text-stone-700 font-bold text-sm flex items-center justify-center transition-colors"
                >
                  −
                </button>
                <span className="w-6 text-center font-medium text-sm">{quantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="w-7 h-7 rounded-full bg-amber-100 hover:bg-amber-200 text-stone-700 font-bold text-sm flex items-center justify-center transition-colors"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(product.id)}
                  className="ml-1 text-stone-300 hover:text-red-400 transition-colors text-lg leading-none"
                  aria-label="移除"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="px-5 py-4 bg-amber-50 flex justify-between items-center">
          <span className="text-stone-600 font-medium">小計</span>
          <span className="font-bold text-xl text-amber-900">NT$ {totalPrice}</span>
        </div>
      </section>

      {/* Order Form */}
      <section className="bg-white rounded-2xl shadow-sm border border-amber-100 p-5">
        <h2 className="font-semibold text-stone-800 mb-4">取貨資料</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              姓名 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="請輸入姓名"
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              聯絡電話 <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="0912-345-678"
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
            />
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              取貨日期 <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={form.date}
              min={today}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
            />
            {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
            <p className="text-xs text-stone-400 mt-1">取貨時間：09:00 – 18:00</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">備註</label>
            <textarea
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="例如：切片、不要袋等特別要求"
              rows={3}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition resize-none"
            />
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-4 text-sm text-stone-500">
              <span>商品合計</span>
              <span className="font-bold text-stone-800">NT$ {totalPrice}</span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-800 hover:bg-amber-700 disabled:bg-amber-300 text-white font-bold py-3.5 rounded-2xl text-base transition-colors shadow-sm"
            >
              {submitting ? '送出中...' : `確認訂單 — NT$ ${totalPrice}`}
            </button>
            <p className="text-center text-xs text-stone-400 mt-3">
              送出後我們會以電話與您確認訂單
            </p>
          </div>
        </form>
      </section>
    </div>
  )
}
