'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import QRCode from 'qrcode'
import Swal from 'sweetalert2'
import { formatCurrency, getStatusText } from '@/lib/utils'

interface Reservation {
    id: string
    customerName: string
    phone: string
    totalAmount: number
    depositAmount: number
    status: string
    holdExpiresAt: string | null
    table: {
        tableNo: string
        zone: string
        capacity: number
    }
    event: {
        name: string
        date: string
    }
}

export default function PaymentPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const reservationId = searchParams.get('reservationId')

    const [reservation, setReservation] = useState<Reservation | null>(null)
    const [qrCodeUrl, setQrCodeUrl] = useState('')
    const [slipFile, setSlipFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [timeLeft, setTimeLeft] = useState<number>(0)

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

            // Generate QR code for PromptPay (simplified - use actual phone number in production)
            const qrData = `PromptPay:0812345678:${data.reservation.depositAmount}`
            const qr = await QRCode.toDataURL(qrData)
            setQrCodeUrl(qr)

            // Calculate time left
            if (data.reservation.holdExpiresAt) {
                const expiresAt = new Date(data.reservation.holdExpiresAt).getTime()
                const now = Date.now()
                setTimeLeft(Math.max(0, Math.floor((expiresAt - now) / 1000)))
            }
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

    useEffect(() => {
        if (timeLeft <= 0) return

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    Swal.fire({
                        icon: 'warning',
                        title: 'หมดเวลา',
                        text: 'หมดเวลาการจอง กรุณาจองใหม่อีกครั้ง',
                        confirmButtonColor: '#6366f1',
                    }).then(() => {
                        router.push(`/event/${reservation?.event}`)
                    })
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft])

    const handleUploadSlip = async () => {
        if (!slipFile || !reservationId) return

        setUploading(true)

        try {
            // Convert file to base64
            const reader = new FileReader()
            reader.readAsDataURL(slipFile)
            reader.onload = async () => {
                const base64 = reader.result as string

                const response = await fetch('/api/payments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        reservationId,
                        amount: reservation?.depositAmount,
                        slipData: base64,
                    }),
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'เกิดข้อผิดพลาด')
                }

                router.push(`/event/${reservation?.event}/confirmation?reservationId=${reservationId}`)
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัปโหลด'
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: errorMessage,
                confirmButtonColor: '#6366f1',
            })
            setUploading(false)
        }
    }

    if (!reservation) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white text-xl">กำลังโหลด...</div>
            </div>
        )
    }

    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8 text-center">ชำระเงินมัดจำ</h1>

                {/* Timer */}
                {timeLeft > 0 && (
                    <div className="mb-6 bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 text-center">
                        <div className="text-yellow-300 font-bold text-2xl">
                            ⏰ เหลือเวลา {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                        </div>
                        <div className="text-yellow-200 text-sm mt-1">
                            กรุณาชำระเงินภายในเวลาที่กำหนด
                        </div>
                    </div>
                )}

                {/* Reservation Info */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">ข้อมูลการจอง</h2>
                    <div className="space-y-2 text-white">
                        <div className="flex justify-between">
                            <span className="text-gray-300">งาน:</span>
                            <span className="font-semibold">{reservation.event.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-300">โต๊ะ:</span>
                            <span className="font-semibold">{reservation.table.tableNo} ({reservation.table.zone})</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-300">ชื่อผู้จอง:</span>
                            <span className="font-semibold">{reservation.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-300">เบอร์โทร:</span>
                            <span className="font-semibold">{reservation.phone}</span>
                        </div>
                        <div className="flex justify-between pt-4 border-t border-white/20">
                            <span className="text-gray-300">ยอดมัดจำ:</span>
                            <span className="font-bold text-2xl text-yellow-300">
                                {formatCurrency(reservation.depositAmount)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* QR Code */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
                    <h2 className="text-xl font-bold text-white mb-4 text-center">สแกน QR Code เพื่อชำระเงิน</h2>
                    <div className="flex justify-center mb-4">
                        {qrCodeUrl && (
                            <div className="bg-white p-4 rounded-lg">
                                <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                            </div>
                        )}
                    </div>
                    <p className="text-center text-gray-300 text-sm">
                        สแกน QR Code ด้วยแอปธนาคารของคุณ
                    </p>
                </div>

                {/* Upload Slip */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <h2 className="text-xl font-bold text-white mb-4">อัปโหลดสลิปการโอนเงิน</h2>

                    <div className="mb-4">
                        <label className="block text-white mb-2">เลือกไฟล์สลิป</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                        />
                    </div>

                    {slipFile && (
                        <div className="mb-4">
                            <img
                                src={URL.createObjectURL(slipFile)}
                                alt="Preview"
                                className="max-w-full h-auto rounded-lg border border-white/30"
                            />
                        </div>
                    )}

                    <button
                        onClick={handleUploadSlip}
                        disabled={!slipFile || uploading}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? 'กำลังอัปโหลด...' : 'ยืนยันการชำระเงิน'}
                    </button>
                </div>
            </div>
        </div>
    )
}
