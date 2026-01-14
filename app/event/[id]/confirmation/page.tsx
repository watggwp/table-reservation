'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import QRCode from 'qrcode'
import Swal from 'sweetalert2'
import { formatDate, formatCurrency, getStatusText } from '@/lib/utils'

interface Reservation {
    id: string
    customerName: string
    phone: string
    totalAmount: number
    depositAmount: number
    status: string
    table: {
        tableNo: string
        zone: string
        capacity: number
    }
    event: {
        id: string
        name: string
        date: string
    }
}

export default function ConfirmationPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const reservationId = searchParams.get('reservationId')

    const [reservation, setReservation] = useState<Reservation | null>(null)
    const [qrCodeUrl, setQrCodeUrl] = useState('')

    useEffect(() => {
        if (!reservationId) {
            router.push('/')
            return
        }

        fetchReservation()
    }, [reservationId])

    const fetchReservation = async () => {
        try {
            const response = await fetch(`/api/reservations/${reservationId}`)
            const data = await response.json()
            setReservation(data.reservation)

            // Generate booking QR code
            const qr = await QRCode.toDataURL(reservationId)
            setQrCodeUrl(qr)
        } catch (error) {
            console.error('Failed to fetch reservation:', error)
            Swal.fire({
                icon: 'error',
                title: 'ไม่พบข้อมูล',
                text: 'ไม่พบข้อมูลการจอง',
                confirmButtonColor: '#6366f1',
            }).then(() => {
                router.push('/')
            })
        }
    }

    if (!reservation) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white text-xl">กำลังโหลด...</div>
            </div>
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'bg-green-500'
            case 'WAITING_APPROVAL':
                return 'bg-yellow-500'
            default:
                return 'bg-gray-500'
        }
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-3xl mx-auto">
                {/* Success Icon */}
                <div className="text-center mb-8">
                    <div className="text-8xl mb-4">✅</div>
                    <h1 className="text-4xl font-bold text-white mb-2">การจองสำเร็จ!</h1>
                    <p className="text-gray-300 text-lg">ขอบคุณที่ใช้บริการ</p>
                </div>

                {/* Status */}
                <div className={`${getStatusColor(reservation.status)} rounded-lg p-4 mb-6 text-center`}>
                    <div className="text-white font-bold text-xl">
                        สถานะ: {getStatusText(reservation.status)}
                    </div>
                    {reservation.status === 'WAITING_APPROVAL' && (
                        <div className="text-white text-sm mt-1">
                            กรุณารอแอดมินตรวจสอบการชำระเงิน
                        </div>
                    )}
                </div>

                {/* QR Code for Check-in */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
                    <h2 className="text-xl font-bold text-white mb-4 text-center">QR Code สำหรับเช็คอิน</h2>
                    <div className="flex justify-center mb-4">
                        {qrCodeUrl && (
                            <div className="bg-white p-4 rounded-lg">
                                <img src={qrCodeUrl} alt="Booking QR Code" className="w-64 h-64" />
                            </div>
                        )}
                    </div>
                    <p className="text-center text-gray-300 text-sm">
                        แสดง QR Code นี้ในวันงานเพื่อเช็คอิน
                    </p>
                </div>

                {/* Reservation Details */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">รายละเอียดการจอง</h2>
                    <div className="space-y-3 text-white">
                        <div className="flex justify-between">
                            <span className="text-gray-300">รหัสการจอง:</span>
                            <span className="font-mono font-semibold">{reservation.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-300">งาน:</span>
                            <span className="font-semibold">{reservation.event.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-300">โต๊ะ:</span>
                            <span className="font-semibold">{reservation.table.tableNo} ({reservation.table.zone})</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-300">จำนวนที่นั่ง:</span>
                            <span className="font-semibold">{reservation.table.capacity} ที่</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-300">ชื่อผู้จอง:</span>
                            <span className="font-semibold">{reservation.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-300">เบอร์โทร:</span>
                            <span className="font-semibold">{reservation.phone}</span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-white/20">
                            <span className="text-gray-300">มัดจำที่ชำระ:</span>
                            <span className="font-bold text-xl text-green-300">
                                {formatCurrency(reservation.depositAmount)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-300">ยอดคงเหลือ:</span>
                            <span className="font-bold text-xl text-yellow-300">
                                {formatCurrency(reservation.totalAmount - reservation.depositAmount)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Important Notes */}
                <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4 mb-6">
                    <h3 className="text-white font-bold mb-2">📌 ข้อควรทราบ</h3>
                    <ul className="text-blue-200 text-sm space-y-1 list-disc list-inside">
                        <li>กรุณาเก็บ QR Code นี้ไว้สำหรับเช็คอินในวันงาน</li>
                        <li>กรุณาชำระยอดคงเหลือในวันงาน</li>
                        <li>หากมีข้อสงสัย กรุณาติดต่อผู้จัดงาน</li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/')}
                        className="flex-1 py-3 bg-white/10 border border-white/30 text-white rounded-lg font-semibold hover:bg-white/20 transition-all"
                    >
                        กลับหน้าหลัก
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                    >
                        พิมพ์ใบจอง
                    </button>
                </div>
            </div>
        </div>
    )
}
