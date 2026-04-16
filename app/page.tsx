import Link from 'next/link'
import BakingCalendar from './components/BakingCalendar'

const features = [
  {
    icon: '👐',
    title: '純手工製作',
    desc: '每一條麵包都由師傅親手揉製，不用麵包機，保留最真實的手感與溫度',
  },
  {
    icon: '🌾',
    title: '天然食材',
    desc: '嚴選無添加麵粉、天然酵母及本地農產，拒絕人工色素與防腐劑',
  },
  {
    icon: '⏰',
    title: '每日新鮮出爐',
    desc: '凌晨三點開始製作，確保您每天早晨都能買到最新鮮的麵包',
  },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-100 via-orange-50 to-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-amber-600 text-sm font-medium tracking-widest uppercase mb-4">
            Artisan Bakery · 手工烘焙
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-stone-700 mb-6">
            每一口，都是<br />
            <span className="text-amber-500">用心烘焙的溫度</span>
          </h1>
          <p className="text-stone-500 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            CC Baker 堅持每日手工製作，使用天然食材，
            為您帶來最純粹的麵包香氣與口感。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/menu"
              className="bg-amber-400 hover:bg-amber-300 text-white font-bold px-8 py-3 rounded-full text-base transition-colors shadow-sm"
            >
              查看今日菜單 →
            </Link>
            <Link
              href="/cart"
              className="border border-amber-200 text-amber-600 hover:bg-orange-50 px-8 py-3 rounded-full text-base transition-colors font-medium"
            >
              我的購物車
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 px-4 bg-orange-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {features.map(f => (
              <div key={f.title} className="text-center px-4">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-stone-700 mb-2">{f.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Baking Calendar */}
      <BakingCalendar />

      {/* CTA */}
      <section className="bg-amber-400 text-white py-12 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-3">準備好訂購了嗎？</h2>
          <p className="text-amber-100 mb-6 text-sm leading-relaxed">
            瀏覽完整菜單，加入購物車，即可預訂您喜愛的麵包。<br />
            每日限量，請盡早下單！
          </p>
          <Link
            href="/menu"
            className="inline-block bg-white text-amber-700 font-bold px-8 py-3 rounded-full hover:bg-orange-50 transition-colors"
          >
            立即選購
          </Link>
        </div>
      </section>
    </div>
  )
}
