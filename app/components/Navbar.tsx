import Link from 'next/link'
import CartButton from './CartButton'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-rose-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-wide text-stone-700 hover:text-rose-400 transition-colors">
          <span>🍞</span>
          <span>CC Baker</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-stone-500 hover:text-rose-400 transition-colors hidden sm:block">
            首頁
          </Link>
          <Link href="/menu" className="text-stone-500 hover:text-rose-400 transition-colors">
            菜單
          </Link>
          <Link href="/orders" className="text-stone-500 hover:text-rose-400 transition-colors">
            查訂單
          </Link>
          <CartButton />
        </div>
      </div>
    </nav>
  )
}
