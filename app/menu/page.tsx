import type { Metadata } from 'next'
import MenuClient from './MenuClient'

export const metadata: Metadata = {
  title: '菜單 — CC Baker',
  description: '瀏覽 CC Baker 全部手工麵包，包含歐式麵包、法式糕點、吐司及特色麵包',
}

export default function MenuPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-rose-400 text-xs font-semibold tracking-widest uppercase mb-1">Menu</p>
        <h1 className="text-3xl font-bold text-stone-700 mb-2">今日菜單</h1>
        <p className="text-stone-500 text-sm">所有麵包均為每日凌晨手工製作，新鮮出爐</p>
      </div>
      <MenuClient />
    </div>
  )
}
