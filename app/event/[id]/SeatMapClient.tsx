'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import SeatMap from '@/components/SeatMap'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Table {
    id: string
    tableNo: string
    zone: string
    capacity: number
    priceOverride: number | null
    posX: number
    posY: number
    status: string
    reservations?: Array<{
        status: string
        qty: number
    }>
}

interface Event {
    id: string
    name: string
    date: Date
    location: string
    tableCapacity: number
    pricePerTable: number
    depositAmount: number
    tables: Table[]
}

export default function SeatMapClient({ event }: { event: Event }) {
    const router = useRouter()
    const [selectedTable, setSelectedTable] = useState<Table | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [customerName, setCustomerName] = useState('')
    const [phone, setPhone] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleTableSelect = (table: Table) => {
        setSelectedTable(table)
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setCustomerName('')
        setPhone('')
    }

    const handleReserve = async () => {
        if (!selectedTable || !customerName || !phone) {
            Swal.fire({
                icon: 'warning',
                title: 'ข้อมูลไม่ครบถ้วน',
                text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                confirmButtonColor: '#6366f1',
            })
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId: event.id,
                    tableId: selectedTable.id,
                    customerName,
                    phone,
                    qty: selectedTable.capacity,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'เกิดข้อผิดพลาด')
            }

            router.push(`/event/${event.id}/payment?reservationId=${data.reservation.id}`)
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการจอง'
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: errorMessage,
                confirmButtonColor: '#6366f1',
            })
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <button
                        onClick={() => router.push('/')}
                        className="text-white hover:text-indigo-300 mb-4 flex items-center gap-2 transition-colors"
                    >
                        ← กลับหน้าหลัก
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{event.name}</h1>
                    <div className="flex flex-wrap gap-3 md:gap-4 text-sm md:text-base text-gray-300">
                        <span>📅 {formatDate(new Date(event.date))}</span>
                        <span>📍 {event.location}</span>
                        <span>💰 {formatCurrency(event.pricePerTable)} / โต๊ะ</span>
                    </div>
                </div>

                {/* Seat Map */}
                <SeatMap
                    eventId={event.id}
                    tables={event.tables}
                    pricePerTable={event.pricePerTable}
                    onSelectTable={handleTableSelect}
                />

                {/* Modal */}
                {showModal && selectedTable && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                        <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-6 md:p-8 max-w-lg w-full border border-indigo-500/30 shadow-2xl shadow-indigo-500/20 animate-slide-in">
                            {/* Modal Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">จองโต๊ะ</h2>
                                    <p className="text-gray-400 text-sm">กรอกข้อมูลเพื่อจองโต๊ะ</p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-white text-3xl transition-colors"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Table Info Card */}
                            <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl p-6 mb-6 border border-indigo-400/30">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center border-4 border-white/20 shadow-lg">
                                        <span className="text-white font-bold text-xl">{selectedTable.tableNo}</span>
                                    </div>
                                    <div>
                                        <div className="text-white font-bold text-lg">{selectedTable.zone}</div>
                                        <div className="text-gray-300 text-sm">{selectedTable.capacity} ที่นั่ง</div>
                                    </div>
                                </div>
                                <div className="space-y-2 text-white">
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">ราคาเต็ม:</span>
                                        <span className="font-semibold">
                                            {formatCurrency(selectedTable.priceOverride || event.pricePerTable)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/20">
                                        <span>มัดจำ:</span>
                                        <span className="text-yellow-300">{formatCurrency(event.depositAmount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-white mb-2 font-semibold text-sm">ชื่อ-นามสกุล *</label>
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        placeholder="กรอกชื่อ-นามสกุล"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-white mb-2 font-semibold text-sm">เบอร์โทรศัพท์ *</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        placeholder="0812345678"
                                    />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-6">
                                <p className="text-yellow-200 text-xs md:text-sm flex items-start gap-2">
                                    <span className="text-lg">⏱️</span>
                                    <span>ระบบจะล็อกโต๊ะไว้ให้ 10 นาที สำหรับการชำระเงิน</span>
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all border border-white/20"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleReserve}
                                    disabled={isSubmitting || !customerName || !phone}
                                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            กำลังจอง...
                                        </span>
                                    ) : (
                                        'ยืนยันการจอง →'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
