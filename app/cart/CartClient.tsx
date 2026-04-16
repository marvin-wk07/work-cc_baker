'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '../context/CartContext'
import { saveOrder } from '../lib/orders'
import { subscribeShippingDates, formatShippingDate, ShippingDate } from '../lib/shippingDates'

type FormData = {
  name: string
  phone: string
  note: string
}

export default function CartClient() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice, totalCapacity } = useCart()
  const [form, setForm] = useState<FormData>({ name: '', phone: '', note: '' })
  const [selectedShipping, setSelectedShipping] = useState<ShippingDate | null>(null)
  const [shippingDates, setShippingDates] = useState<ShippingDate[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData & { date: string; capacity: string }>>({})

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const unsub = subscribeShippingDates(dates => {
      setShippingDates(dates.filter(d => d.date >= today))
    })
    return () => unsub()
  }, [])

  // Remaining capacity for the selected date
  const remainingCapacity = selectedShipping
    ? selectedShipping.maxCapacity - selectedShipping.usedCapacity
    : null
  const isOverCapacity = remainingCapacity !== null && totalCapacity > remainingCapacity

  const validate = () => {
    const e: Partial<FormData & { date: string; capacity: string }> = {}
    if (!form.name.trim()) e.name = '請填寫姓名'
    if (!form.phone.trim()) e.phone = '請填寫電話'
    else if (!/^[0-9+\-\s]{8,15}$/.test(form.phone.trim())) e.phone = '請輸入有效電話號碼'
    if (!selectedShipping) e.date = '請選擇出貨日期'
    if (isOverCapacity) {
      e.capacity = `所選商品製作能量（${totalCapacity}）超過此日期剩餘產能（${remainingCapacity}），請減少商品數量或選擇其他日期`
    }
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
      await saveOrder({
        ...form,
        date: selectedShipping!.date,
        shippingDateId: selectedShipping!.id,
        items,
        totalPrice,
      })
      clearCart()
      setSubmitted(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : '送出失敗，請稍後再試')
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
          我們已收到您的訂單，將在出貨前一天以電話確認。
        </p>
        <p className="text-amber-600 font-medium mb-8">感謝您選擇 CC Baker 🍞</p>
        <Link
          href="/menu"
          className="inline-block bg-amber-400 hover:bg-amber-300 text-white font-medium px-8 py-3 rounded-full transition-colors"
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
          className="inline-block bg-amber-400 hover:bg-amber-300 text-white font-medium px-8 py-3 rounded-full transition-colors"
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
          <div>
            <h2 className="font-semibold text-stone-800">已選商品 ({totalItems} 件)</h2>
            {selectedShipping && (
              <p className={`text-xs mt-0.5 font-medium ${isOverCapacity ? 'text-red-500' : 'text-stone-400'}`}>
                製作能量：{totalCapacity}
                {remainingCapacity !== null && (
                  <span> ／ 剩餘 {remainingCapacity}</span>
                )}
              </p>
            )}
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            清空購物車
          </button>
        </div>
        <ul>
          {items.map(({ product, quantity, variant, addon, cartKey }) => {
            const itemCapacity = product.capacity ?? 10
            // Disable + if adding one more would exceed remaining capacity for selected date
            const wouldExceed = remainingCapacity !== null
              && totalCapacity + itemCapacity > remainingCapacity
            const atMaxQty = product.maxQty !== undefined && quantity >= product.maxQty
            return (
              <li
                key={cartKey}
                className="flex items-center gap-4 px-5 py-4 border-b border-orange-50 last:border-b-0"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ backgroundColor: product.bgColor }}
                >
                  {product.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-800 text-sm truncate">{product.name}</p>
                  <div className="flex gap-1 flex-wrap mt-0.5">
                    {variant && (
                      <span className="text-xs bg-orange-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">{variant.label}</span>
                    )}
                    {addon && (
                      <span className="text-xs bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-full font-medium">加{addon.label}</span>
                    )}
                    {product.capacity !== undefined && product.capacity !== 1 && (
                      <span className="text-xs bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full font-medium">能量 {product.capacity}</span>
                    )}
                  </div>
                  <p className="text-amber-600 text-sm font-semibold mt-0.5">
                    NT$ {(variant?.price ?? product.price) + (addon?.price ?? 0)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateQuantity(cartKey, quantity - 1)}
                    className="w-7 h-7 rounded-full bg-amber-100 hover:bg-amber-200 text-stone-700 font-bold text-sm flex items-center justify-center transition-colors"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-medium text-sm">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(cartKey, quantity + 1)}
                    disabled={atMaxQty || wouldExceed}
                    className="w-7 h-7 rounded-full bg-amber-100 hover:bg-amber-200 text-stone-700 font-bold text-sm flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(cartKey)}
                    className="ml-1 text-stone-300 hover:text-red-400 transition-colors text-lg leading-none"
                    aria-label="移除"
                  >
                    ×
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
        <div className="px-5 py-4 bg-orange-100 flex justify-between items-center">
          <span className="text-stone-600 font-medium">小計</span>
          <span className="font-bold text-xl text-amber-700">NT$ {totalPrice}</span>
        </div>
      </section>

      {/* Order Form */}
      <section className="bg-white rounded-2xl shadow-sm border border-amber-100 p-5">
        <h2 className="font-semibold text-stone-800 mb-4">出貨資料</h2>
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
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 bg-white placeholder:text-stone-400 focus:outline-none focus:border-amber-200 focus:ring-2 focus:ring-amber-100 transition"
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
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 bg-white placeholder:text-stone-400 focus:outline-none focus:border-amber-200 focus:ring-2 focus:ring-amber-100 transition"
            />
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Shipping Date Selector */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              出貨日期 <span className="text-red-400">*</span>
            </label>
            {shippingDates.length === 0 ? (
              <div className="bg-orange-100 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                目前尚無可選的出貨日期，請稍後再試或聯絡我們
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {shippingDates.map(sd => {
                  const remaining = sd.maxCapacity - sd.usedCapacity
                  const isFull = remaining <= 0
                  const isSelected = selectedShipping?.id === sd.id
                  const cartWouldFit = totalCapacity <= remaining
                  return (
                    <button
                      key={sd.id}
                      type="button"
                      disabled={isFull}
                      onClick={() => {
                        setSelectedShipping(sd)
                        setErrors(e => ({ ...e, date: undefined, capacity: undefined }))
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isFull
                          ? 'border-stone-100 bg-stone-50 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'border-amber-400 bg-orange-100 ring-2 ring-amber-200'
                          : 'border-amber-100 bg-white hover:border-amber-200 hover:bg-orange-100'
                      }`}
                    >
                      <p className={`text-sm font-semibold leading-tight ${isSelected ? 'text-amber-700' : 'text-stone-800'}`}>
                        {formatShippingDate(sd.date)}
                      </p>
                      {sd.note && (
                        <p className="text-xs text-stone-400 mt-0.5">{sd.note}</p>
                      )}
                      <p className={`text-xs mt-1 font-medium ${
                        isFull ? 'text-red-400'
                        : !cartWouldFit ? 'text-orange-500'
                        : remaining <= sd.maxCapacity * 0.2 ? 'text-orange-500'
                        : 'text-green-600'
                      }`}>
                        {isFull ? '產能已滿' : `剩餘產能 ${remaining}`}
                        {!isFull && !cartWouldFit && '（不足）'}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
            {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">備註</label>
            <textarea
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="例如：切片、不要袋等特別要求"
              rows={3}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 bg-white placeholder:text-stone-400 focus:outline-none focus:border-amber-200 focus:ring-2 focus:ring-amber-100 transition resize-none"
            />
          </div>

          <div className="pt-2">
            {errors.capacity && (
              <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-600">
                {errors.capacity}
              </div>
            )}
            <div className="flex justify-between items-center mb-4 text-sm text-stone-500">
              <span>商品合計</span>
              <span className="font-bold text-stone-800">NT$ {totalPrice}</span>
            </div>
            <button
              type="submit"
              disabled={submitting || isOverCapacity}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-amber-200 text-white font-bold py-3.5 rounded-2xl text-base transition-colors shadow-sm"
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
