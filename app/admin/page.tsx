import { prisma } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default async function AdminDashboard() {
    // Get all events
    const events = await prisma.event.findMany({
        include: {
            tables: true,
            reservations: {
                include: {
                    table: true,
                }
            }
        },
        orderBy: { date: 'desc' }
    })

    // Calculate statistics
    const totalEvents = events.length
    const activeEvents = events.filter(e => e.status === 'ACTIVE').length

    let totalTables = 0
    let availableTables = 0
    let totalRevenue = 0
    let pendingPayments = 0

    events.forEach(event => {
        totalTables += event.tables.length

        event.tables.forEach(table => {
            const activeReservations = event.reservations.filter(r =>
                r.tableId === table.id &&
                ['HOLD', 'PENDING_PAYMENT', 'WAITING_APPROVAL', 'CONFIRMED'].includes(r.status)
            )
            if (activeReservations.length === 0) {
                availableTables++
            }
        })

        event.reservations.forEach(r => {
            if (r.status === 'CONFIRMED') {
                totalRevenue += r.paidAmount
            }
            if (r.status === 'WAITING_APPROVAL') {
                pendingPayments++
            }
        })
    })

    const recentReservations = await prisma.reservation.findMany({
        take: 10,
        include: {
            table: true,
            event: true,
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 border border-white/20">
                    <div className="text-purple-200 text-sm mb-1">งานทั้งหมด</div>
                    <div className="text-white text-3xl font-bold">{totalEvents}</div>
                    <div className="text-purple-200 text-xs mt-1">{activeEvents} งานกำลังเปิดรับจอง</div>
                </div>

                <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 border border-white/20">
                    <div className="text-green-200 text-sm mb-1">โต๊ะว่าง</div>
                    <div className="text-white text-3xl font-bold">{availableTables}</div>
                    <div className="text-green-200 text-xs mt-1">จาก {totalTables} โต๊ะทั้งหมด</div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 border border-white/20">
                    <div className="text-blue-200 text-sm mb-1">รายได้รวม</div>
                    <div className="text-white text-3xl font-bold">{formatCurrency(totalRevenue)}</div>
                    <div className="text-blue-200 text-xs mt-1">จากการจองที่ยืนยันแล้ว</div>
                </div>

                <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-xl p-6 border border-white/20">
                    <div className="text-yellow-200 text-sm mb-1">รอตรวจสอบ</div>
                    <div className="text-white text-3xl font-bold">{pendingPayments}</div>
                    <div className="text-yellow-200 text-xs mt-1">การชำระเงินรออนุมัติ</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Link
                    href="/admin/events"
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/20 transition-all group"
                >
                    <div className="text-4xl mb-3">🎉</div>
                    <h3 className="text-white font-bold text-lg mb-1 group-hover:text-purple-300">สร้างงานใหม่</h3>
                    <p className="text-gray-400 text-sm">เพิ่มงานอีเว้นท์และตั้งค่า</p>
                </Link>

                <Link
                    href="/admin/tables"
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/20 transition-all group"
                >
                    <div className="text-4xl mb-3">🪑</div>
                    <h3 className="text-white font-bold text-lg mb-1 group-hover:text-purple-300">จัดการโต๊ะ</h3>
                    <p className="text-gray-400 text-sm">ออกแบบผังโต๊ะและจัดโซน</p>
                </Link>

                <Link
                    href="/admin/reservations"
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/20 transition-all group"
                >
                    <div className="text-4xl mb-3">✅</div>
                    <h3 className="text-white font-bold text-lg mb-1 group-hover:text-purple-300">อนุมัติการจอง</h3>
                    <p className="text-gray-400 text-sm">ตรวจสอบและอนุมัติการชำระเงิน</p>
                </Link>
            </div>

            {/* Recent Reservations */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4">การจองล่าสุด</h2>

                {recentReservations.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        ยังไม่มีการจอง
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/20">
                                    <th className="text-left text-white py-3 px-4">งาน</th>
                                    <th className="text-left text-white py-3 px-4">โต๊ะ</th>
                                    <th className="text-left text-white py-3 px-4">ชื่อ</th>
                                    <th className="text-left text-white py-3 px-4">เบอร์</th>
                                    <th className="text-left text-white py-3 px-4">ยอดเงิน</th>
                                    <th className="text-left text-white py-3 px-4">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentReservations.map((reservation) => (
                                    <tr key={reservation.id} className="border-b border-white/10 hover:bg-white/5">
                                        <td className="py-3 px-4 text-gray-300">{reservation.event.name}</td>
                                        <td className="py-3 px-4 text-gray-300">{reservation.table.tableNo}</td>
                                        <td className="py-3 px-4 text-white">{reservation.customerName}</td>
                                        <td className="py-3 px-4 text-gray-300">{reservation.phone}</td>
                                        <td className="py-3 px-4 text-white">{formatCurrency(reservation.paidAmount)}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${reservation.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-300' :
                                                    reservation.status === 'WAITING_APPROVAL' ? 'bg-yellow-500/20 text-yellow-300' :
                                                        reservation.status === 'CANCELED' ? 'bg-red-500/20 text-red-300' :
                                                            'bg-gray-500/20 text-gray-300'
                                                }`}>
                                                {reservation.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
