import Link from 'next/link'
import CartButton from './CartButton'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-amber-950 text-amber-50 shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-wide hover:text-amber-200 transition-colors">
          <span>🍞</span>
          <span>CC Baker</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-amber-300 transition-colors hidden sm:block">
            首頁
          </Link>
          <Link href="/menu" className="hover:text-amber-300 transition-colors">
            菜單
          </Link>
          <Link href="/orders" className="hover:text-amber-300 transition-colors hidden sm:block">
            查訂單
          </Link>
          <CartButton />
        </div>
      </div>
    </nav>
  )
}
