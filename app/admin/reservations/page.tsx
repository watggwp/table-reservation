'use client'

import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { formatCurrency, formatDate, getStatusText } from '@/lib/utils'

interface Reservation {
    id: string
    customerName: string
    phone: string
    qty: number
    totalAmount: number
    depositAmount: number
    paidAmount: number
    status: string
    createdAt: string
    table: {
        tableNo: string
        zone: string
    }
    event: {
        name: string
    }
    payments: Array<{
        id: string
        slipUrl: string | null
        verifyStatus: string
    }>
}

export default function ReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([])
    const [filter, setFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

    useEffect(() => {
        fetchReservations()
    }, [])

    const fetchReservations = async () => {
        const response = await fetch('/api/reservations')
        const data = await response.json()
        setReservations(data.reservations)
    }

    const handleApprovePayment = async (paymentId: string) => {
        if (!confirm('ยืนยันการอนุมัติการชำระเงิน?')) return

        try {
            const response = await fetch('/api/payments', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentId,
                    verifyStatus: 'APPROVED',
                }),
            })

            if (!response.ok) throw new Error('Failed to approve payment')

            Swal.fire({
                icon: 'success',
                title: 'สำเร็จ!',
                text: 'อนุมัติสำเร็จ',
                confirmButtonColor: '#6366f1',
            })
            fetchReservations()
            setSelectedReservation(null)
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถอนุมัติได้',
                confirmButtonColor: '#6366f1',
            })
        }
    }

    const handleRejectPayment = async (paymentId: string) => {
        const result = await Swal.fire({
            title: 'ยืนยันการปฏิเสธ?',
            text: 'คุณต้องการปฏิเสธการชำระเงินนี้หรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'ใช่, ปฏิเสธ!',
            cancelButtonText: 'ยกเลิก',
        });
        if (!result.isConfirmed) {
            return;
        }

        try {
            const response = await fetch('/api/payments', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentId,
                    verifyStatus: 'REJECTED',
                }),
            })

            if (!response.ok) throw new Error('Failed to reject payment')

            Swal.fire({
                icon: 'success',
                title: 'สำเร็จ!',
                text: 'ปฏิเสธสำเร็จ',
                confirmButtonColor: '#6366f1',
            })
            fetchReservations()
            setSelectedReservation(null)
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถปฏิเสธได้',
                confirmButtonColor: '#6366f1',
            })
        }
    }

    const handleCancelReservation = async (reservationId: string) => {
        const result = await Swal.fire({
            title: 'ยืนยันการยกเลิก?',
            text: 'คุณต้องการยกเลิกการจองนี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'ใช่, ยกเลิก!',
            cancelButtonText: 'ไม่, เก็บไว้',
        });
        if (!result.isConfirmed) {
            return;
        }

        try {
            const response = await fetch(`/api/reservations/${reservationId}`, {
                method: 'DELETE',
            })

            if (!response.ok) throw new Error('Failed to cancel reservation')

            Swal.fire({
                icon: 'success',
                title: 'สำเร็จ!',
                text: 'ยกเลิกสำเร็จ',
                confirmButtonColor: '#6366f1',
            })
            fetchReservations()
            setSelectedReservation(null)
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถยกเลิกได้',
                confirmButtonColor: '#6366f1',
            })
        }
    }

    const filteredReservations = reservations.filter(r => {
        const matchesSearch =
            r.customerName.toLowerCase().includes(filter.toLowerCase()) ||
            r.phone.includes(filter) ||
            r.table.tableNo.toLowerCase().includes(filter.toLowerCase())

        const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter

        return matchesSearch && matchesStatus
    })

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-8">จัดการการจอง</h1>

            {/* Filters */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-white mb-2">ค้นหา</label>
                        <input
                            type="text"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder="ชื่อ, เบอร์โทร, เลขโต๊ะ..."
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-white mb-2">สถานะ</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="ALL">ทั้งหมด</option>
                            <option value="HOLD">กำลังจอง</option>
                            <option value="PENDING_PAYMENT">รอชำระเงิน</option>
                            <option value="WAITING_APPROVAL">รออนุมัติ</option>
                            <option value="CONFIRMED">ยืนยันแล้ว</option>
                            <option value="CANCELED">ยกเลิก</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Reservations Table */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/20">
                                <th className="text-left text-white py-3 px-4">งาน</th>
                                <th className="text-left text-white py-3 px-4">โต๊ะ</th>
                                <th className="text-left text-white py-3 px-4">ชื่อ</th>
                                <th className="text-left text-white py-3 px-4">เบอร์</th>
                                <th className="text-left text-white py-3 px-4">ที่นั่ง</th>
                                <th className="text-left text-white py-3 px-4">ยอดเงิน</th>
                                <th className="text-left text-white py-3 px-4">สถานะ</th>
                                <th className="text-left text-white py-3 px-4">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReservations.map((reservation) => (
                                <tr key={reservation.id} className="border-b border-white/10 hover:bg-white/5">
                                    <td className="py-3 px-4 text-gray-300">{reservation.event.name}</td>
                                    <td className="py-3 px-4 text-white font-semibold">
                                        {reservation.table.tableNo}
                                        <div className="text-xs text-gray-400">{reservation.table.zone}</div>
                                    </td>
                                    <td className="py-3 px-4 text-white">{reservation.customerName}</td>
                                    <td className="py-3 px-4 text-gray-300">{reservation.phone}</td>
                                    <td className="py-3 px-4 text-gray-300">{reservation.qty} ที่</td>
                                    <td className="py-3 px-4 text-white">
                                        {formatCurrency(reservation.paidAmount)}
                                        <div className="text-xs text-gray-400">
                                            จาก {formatCurrency(reservation.totalAmount)}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${reservation.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-300' :
                                            reservation.status === 'WAITING_APPROVAL' ? 'bg-yellow-500/20 text-yellow-300' :
                                                reservation.status === 'CANCELED' ? 'bg-red-500/20 text-red-300' :
                                                    'bg-gray-500/20 text-gray-300'
                                            }`}>
                                            {getStatusText(reservation.status)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <button
                                            onClick={() => setSelectedReservation(reservation)}
                                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-all"
                                        >
                                            ดูรายละเอียด
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredReservations.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            ไม่พบข้อมูลการจอง
                        </div>
                    )}
                </div>
            </div>

            {/* Reservation Detail Modal */}
            {selectedReservation && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                    <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-bold text-white">รายละเอียดการจอง</h2>
                            <button
                                onClick={() => setSelectedReservation(null)}
                                className="text-white hover:text-gray-300 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="grid grid-cols-2 gap-4 text-white">
                                <div>
                                    <div className="text-gray-400 text-sm">รหัสการจอง</div>
                                    <div className="font-mono">{selectedReservation.id.slice(0, 8).toUpperCase()}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">สถานะ</div>
                                    <div className="font-semibold">{getStatusText(selectedReservation.status)}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">งาน</div>
                                    <div>{selectedReservation.event.name}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">โต๊ะ</div>
                                    <div>{selectedReservation.table.tableNo} ({selectedReservation.table.zone})</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">ชื่อผู้จอง</div>
                                    <div>{selectedReservation.customerName}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">เบอร์โทร</div>
                                    <div>{selectedReservation.phone}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">จำนวนที่นั่ง</div>
                                    <div>{selectedReservation.qty} ที่</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">วันที่จอง</div>
                                    <div>{formatDate(new Date(selectedReservation.createdAt))}</div>
                                </div>
                            </div>

                            <div className="border-t border-white/20 pt-4">
                                <div className="grid grid-cols-2 gap-4 text-white">
                                    <div>
                                        <div className="text-gray-400 text-sm">ยอดรวม</div>
                                        <div className="text-xl font-bold">{formatCurrency(selectedReservation.totalAmount)}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">ชำระแล้ว</div>
                                        <div className="text-xl font-bold text-green-300">{formatCurrency(selectedReservation.paidAmount)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Slips */}
                            {selectedReservation.payments.length > 0 && (
                                <div className="border-t border-white/20 pt-4">
                                    <h3 className="text-white font-bold mb-3">สลิปการโอนเงิน</h3>
                                    {selectedReservation.payments.map((payment) => (
                                        <div key={payment.id} className="mb-4">
                                            {payment.slipUrl && (
                                                <img
                                                    src={payment.slipUrl}
                                                    alt="Payment Slip"
                                                    className="max-w-full h-auto rounded-lg border border-white/30 mb-2"
                                                />
                                            )}
                                            <div className="flex gap-2">
                                                {payment.verifyStatus === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprovePayment(payment.id)}
                                                            className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
                                                        >
                                                            ✓ อนุมัติ
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectPayment(payment.id)}
                                                            className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
                                                        >
                                                            ✗ ปฏิเสธ
                                                        </button>
                                                    </>
                                                )}
                                                {payment.verifyStatus === 'APPROVED' && (
                                                    <div className="w-full py-2 bg-green-500/20 text-green-300 rounded-lg text-center font-semibold">
                                                        ✓ อนุมัติแล้ว
                                                    </div>
                                                )}
                                                {payment.verifyStatus === 'REJECTED' && (
                                                    <div className="w-full py-2 bg-red-500/20 text-red-300 rounded-lg text-center font-semibold">
                                                        ✗ ปฏิเสธแล้ว
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            {selectedReservation.status !== 'CANCELED' && (
                                <button
                                    onClick={() => handleCancelReservation(selectedReservation.id)}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
                                >
                                    ยกเลิกการจอง
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedReservation(null)}
                                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
                            >
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
