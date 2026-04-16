'use client'

import { useState, useEffect } from 'react'
import { subscribeShippingDates, formatShippingDate, ShippingDate } from '../lib/shippingDates'

function CapacityBadge({ remaining, max }: { remaining: number; max: number }) {
  if (max === 0) return null
  const pct = Math.min(100, ((max - remaining) / max) * 100)
  const isFull = remaining <= 0
  const isLow = !isFull && remaining <= max * 0.2

  const barColor = isFull ? 'bg-rose-300' : isLow ? 'bg-amber-300' : 'bg-emerald-300'
  const textColor = isFull ? 'text-red-400' : isLow ? 'text-amber-600' : 'text-emerald-600'
  const label = isFull ? '已額滿' : `剩餘製作能量 ${remaining} / ${max}`

  return (
    <div className="mt-2">
      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <p className={`text-xs font-medium mt-1 ${textColor}`}>{label}</p>
    </div>
  )
}

export default function BakingCalendar() {
  const [dates, setDates] = useState<ShippingDate[]>([])
  const [loaded, setLoaded] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const unsub = subscribeShippingDates(all => {
      setDates(all.filter(d => d.date >= today))
      setLoaded(true)
    })
    return () => unsub()
  }, [])

  if (!loaded) return null
  if (dates.length === 0) return null

  // Parse date for display
  const parseDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    const days = ['日', '一', '二', '三', '四', '五', '六']
    return {
      month: d.getMonth() + 1,
      day: d.getDate(),
      weekday: days[d.getDay()],
      isToday: dateStr === today,
    }
  }

  return (
    <section className="py-14 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-amber-500 text-xs font-semibold tracking-widest uppercase mb-1">Baking Schedule</p>
          <h2 className="text-2xl font-bold text-stone-700">烘培月曆</h2>
          <p className="text-stone-400 text-sm mt-1">即將出貨日期及每日剩餘製作能量</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {dates.map(d => {
            const { month, day, weekday, isToday } = parseDate(d.date)
            const remaining = d.maxCapacity - d.usedCapacity
            const isFull = remaining <= 0

            return (
              <div
                key={d.id}
                className={`rounded-2xl p-4 border transition-shadow ${
                  isFull
                    ? 'bg-stone-50 border-stone-100 opacity-60'
                    : isToday
                    ? 'bg-orange-200 border-amber-200 shadow-sm'
                    : 'bg-white border-amber-100 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <p className="text-xs text-stone-400 font-medium">{month}月</p>
                    <p className={`text-3xl font-bold leading-none ${isFull ? 'text-stone-300' : 'text-stone-700'}`}>
                      {day}
                    </p>
                    <p className={`text-xs mt-0.5 ${isFull ? 'text-stone-300' : 'text-stone-400'}`}>週{weekday}</p>
                  </div>
                  {isToday && (
                    <span className="text-xs bg-amber-400 text-white px-1.5 py-0.5 rounded-full font-medium shrink-0">今日</span>
                  )}
                </div>

                {d.note && (
                  <p className="text-xs text-stone-400 mt-2 leading-snug">{d.note}</p>
                )}

                <CapacityBadge remaining={remaining} max={d.maxCapacity} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
