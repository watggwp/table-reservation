'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'

interface Event {
    id: string
    name: string
    date: string
    location: string
    pricePerTable: number
    depositAmount: number
    tables: Array<{
        id: string
        tableNo: string
    }>
    reservations: Array<{
        id: string
        customerName: string
        phone: string
        status: string
        totalAmount: number
        paidAmount: number
        table: {
            tableNo: string
            zone: string
        }
    }>
}

export default function ReportsPage() {
    const [events, setEvents] = useState<Event[]>([])
    const [selectedEventId, setSelectedEventId] = useState('')

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        const response = await fetch('/api/events')
        const data = await response.json()

        // Fetch details for each event
        const eventsWithDetails = await Promise.all(
            data.events.map(async (event: { id: string }) => {
                const eventResponse = await fetch(`/api/tables?eventId=${event.id}`)
                const eventData = await eventResponse.json()

                const reservationsResponse = await fetch(`/api/reservations?eventId=${event.id}`)
                const reservationsData = await reservationsResponse.json()

                return {
                    ...event,
                    tables: eventData.tables,
                    reservations: reservationsData.reservations,
                }
            })
        )

        setEvents(eventsWithDetails)
    }

    const selectedEvent = events.find(e => e.id === selectedEventId)

    const exportToCSV = () => {
        if (!selectedEvent) return

        const headers = ['โต๊ะ', 'โซน', 'ชื่อผู้จอง', 'เบอร์โทร', 'จำนวนที่นั่ง', 'ยอดรวม', 'ชำระแล้ว', 'สถานะ']
        const rows = selectedEvent.reservations.map(r => [
            r.table.tableNo,
            r.table.zone,
            r.customerName,
            r.phone,
            '',
            r.totalAmount,
            r.paidAmount,
            r.status,
        ])

        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n')

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${selectedEvent.name}_reservations.csv`
        link.click()
    }

    const calculateStats = (event: Event) => {
        const totalTables = event.tables.length
        const confirmedReservations = event.reservations.filter(r => r.status === 'CONFIRMED')
        const reservedTables = new Set(confirmedReservations.map(r => r.table.tableNo)).size
        const availableTables = totalTables - reservedTables

        const totalRevenue = confirmedReservations.reduce((sum, r) => sum + r.paidAmount, 0)
        const pendingRevenue = event.reservations
            .filter(r => r.status === 'WAITING_APPROVAL')
            .reduce((sum, r) => sum + r.paidAmount, 0)

        return {
            totalTables,
            reservedTables,
            availableTables,
            totalRevenue,
            pendingRevenue,
            confirmedCount: confirmedReservations.length,
            pendingCount: event.reservations.filter(r => r.status === 'WAITING_APPROVAL').length,
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-8">รายงาน</h1>

            {/* Event Selector */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
                <label className="block text-white mb-2 font-semibold">เลือกงาน</label>
                <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    <option value="">-- เลือกงาน --</option>
                    {events.map((event) => (
                        <option key={event.id} value={event.id}>
                            {event.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedEvent && (
                <>
                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {(() => {
                            const stats = calculateStats(selectedEvent)
                            return (
                                <>
                                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 border border-white/20">
                                        <div className="text-blue-200 text-sm mb-1">โต๊ะทั้งหมด</div>
                                        <div className="text-white text-3xl font-bold">{stats.totalTables}</div>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 border border-white/20">
                                        <div className="text-green-200 text-sm mb-1">โต๊ะว่าง</div>
                                        <div className="text-white text-3xl font-bold">{stats.availableTables}</div>
                                        <div className="text-green-200 text-xs mt-1">จอง {stats.reservedTables} โต๊ะ</div>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 border border-white/20">
                                        <div className="text-purple-200 text-sm mb-1">รายได้รวม</div>
                                        <div className="text-white text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                                        <div className="text-purple-200 text-xs mt-1">{stats.confirmedCount} การจอง</div>
                                    </div>

                                    <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-xl p-6 border border-white/20">
                                        <div className="text-yellow-200 text-sm mb-1">รอตรวจสอบ</div>
                                        <div className="text-white text-2xl font-bold">{formatCurrency(stats.pendingRevenue)}</div>
                                        <div className="text-yellow-200 text-xs mt-1">{stats.pendingCount} รายการ</div>
                                    </div>
                                </>
                            )
                        })()}
                    </div>

                    {/* Export Button */}
                    <div className="mb-6">
                        <button
                            onClick={exportToCSV}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all"
                        >
                            📥 Export CSV
                        </button>
                    </div>

                    {/* Reservations Table */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <h2 className="text-xl font-bold text-white mb-4">รายการจองทั้งหมด</h2>

                        {selectedEvent.reservations.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                ยังไม่มีการจอง
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/20">
                                            <th className="text-left text-white py-3 px-4">โต๊ะ</th>
                                            <th className="text-left text-white py-3 px-4">โซน</th>
                                            <th className="text-left text-white py-3 px-4">ชื่อผู้จอง</th>
                                            <th className="text-left text-white py-3 px-4">เบอร์โทร</th>
                                            <th className="text-left text-white py-3 px-4">ยอดรวม</th>
                                            <th className="text-left text-white py-3 px-4">ชำระแล้ว</th>
                                            <th className="text-left text-white py-3 px-4">คงเหลือ</th>
                                            <th className="text-left text-white py-3 px-4">สถานะ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedEvent.reservations.map((reservation) => (
                                            <tr key={reservation.id} className="border-b border-white/10 hover:bg-white/5">
                                                <td className="py-3 px-4 text-white font-semibold">{reservation.table.tableNo}</td>
                                                <td className="py-3 px-4 text-gray-300">{reservation.table.zone}</td>
                                                <td className="py-3 px-4 text-white">{reservation.customerName}</td>
                                                <td className="py-3 px-4 text-gray-300">{reservation.phone}</td>
                                                <td className="py-3 px-4 text-white">{formatCurrency(reservation.totalAmount)}</td>
                                                <td className="py-3 px-4 text-green-300">{formatCurrency(reservation.paidAmount)}</td>
                                                <td className="py-3 px-4 text-yellow-300">
                                                    {formatCurrency(reservation.totalAmount - reservation.paidAmount)}
                                                </td>
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
                </>
            )}

            {!selectedEventId && (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">📊</div>
                    <h2 className="text-2xl text-white mb-2">เลือกงานเพื่อดูรายงาน</h2>
                    <p className="text-gray-400">กรุณาเลือกงานจากเมนูด้านบน</p>
                </div>
            )}
        </div>
    )
}
