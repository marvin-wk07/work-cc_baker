import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'CC Baker — 手工麵包專賣',
  description: '每日新鮮出爐的手工麵包，使用天然食材，讓您品嚐最純粹的麵包香氣',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-Hant" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-orange-50 text-stone-700">
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="bg-stone-700 text-stone-300 text-center py-6 text-sm">
            <p>© 2026 CC Baker — 每日新鮮，用心製作</p>
            <p className="mt-1 text-stone-400 text-xs">出貨時間：每日 09:00 – 18:00</p>
          </footer>
        </CartProvider>
      </body>
    </html>
  )
}
