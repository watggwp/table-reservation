import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatDate, formatCurrency } from '@/lib/utils'

export default async function HomePage() {
  const events = await prisma.event.findMany({
    where: {
      status: 'ACTIVE',
    },
    orderBy: {
      date: 'asc',
    },
  })

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-600">
            ระบบจองโต๊ะงานอีเว้นท์
          </h1>
          <p className="text-gray-300 text-base md:text-lg">เลือกโต๊ะเองได้ จองง่าย ชำระเงินสะดวก</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8 md:mb-12">
          <Link
            href="/checkin"
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg hover:shadow-xl text-center"
          >
            ✓ เช็คอินเข้างาน
          </Link>
          <Link
            href="/admin"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-center"
          >
            🔐 เข้าสู่ระบบแอดมิน
          </Link>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl text-white mb-2">ยังไม่มีงานที่เปิดรับจอง</h2>
            <p className="text-gray-400">กรุณาติดตามประกาศงานใหม่ๆ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {events.map((event: any, index: number) => (
              <Link
                key={event.id}
                href={`/event/${event.id}`}
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="glass rounded-2xl p-6 border border-white/20 hover:border-indigo-400 transition-all hover:shadow-2xl hover:shadow-indigo-500/30 card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                      {event.name}
                    </h3>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap ml-2">
                      เปิดจอง
                    </span>
                  </div>

                  <div className="space-y-3 text-gray-300 text-sm md:text-base">
                    <div className="flex items-center gap-2">
                      <span className="text-lg md:text-xl">📅</span>
                      <span className="truncate">{formatDate(new Date(event.date))}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg md:text-xl">📍</span>
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg md:text-xl">💰</span>
                      <span>{formatCurrency(event.pricePerTable)} / โต๊ะ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg md:text-xl">👥</span>
                      <span>{event.tableCapacity} ที่นั่ง / โต๊ะ</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10">
                    <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold group-hover:from-indigo-700 group-hover:to-purple-700 transition-all shadow-lg">
                      เลือกโต๊ะเลย →
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 md:mt-16 text-center text-gray-400 text-xs md:text-sm">
          <p>ระบบจองโต๊ะงานอีเว้นท์ - พัฒนาด้วย Next.js & Prisma</p>
        </div>
      </div>
    </div>
  )
}
