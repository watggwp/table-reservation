'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CheckInPage() {
    const router = useRouter()
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [reservation, setReservation] = useState<any>(null)

    const handleCheckIn = async () => {
        if (!code.trim()) {
            setError('กรุณากรอกรหัสการจอง')
            return
        }

        setLoading(true)
        setError('')

        try {
            // Get reservation by code
            const response = await fetch(`/api/reservations/${code}`)
            if (!response.ok) {
                throw new Error('ไม่พบการจองนี้')
            }

            const data = await response.json()

            if (data.reservation.status !== 'CONFIRMED') {
                throw new Error('การจองนี้ยังไม่ได้รับการยืนยัน')
            }

            // Create check-in record
            const checkInResponse = await fetch('/api/checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reservationId: code }),
            })

            if (!checkInResponse.ok) {
                const errorData = await checkInResponse.json()
                throw new Error(errorData.error || 'เกิดข้อผิดพลาด')
            }

            setReservation(data.reservation)
            setSuccess(true)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (success && reservation) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl animate-fade-in">
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">เช็คอินสำเร็จ!</h1>
                            <p className="text-gray-300">ยินดีต้อนรับเข้างาน</p>
                        </div>

                        <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
                            <div className="space-y-3 text-white">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">ชื่อผู้จอง:</span>
                                    <span className="font-semibold">{reservation.customerName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">โต๊ะ:</span>
                                    <span className="font-semibold">{reservation.table.tableNo}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">โซน:</span>
                                    <span className="font-semibold">{reservation.table.zone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">จำนวนที่นั่ง:</span>
                                    <span className="font-semibold">{reservation.qty} ที่</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push('/')}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg"
                        >
                            กลับหน้าหลัก
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">เช็คอินเข้างาน</h1>
                        <p className="text-gray-300">กรุณากรอกรหัสการจองของคุณ</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-white mb-2 font-semibold">รหัสการจอง</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="กรอกรหัส 8 หลัก"
                                className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-2xl font-mono tracking-wider"
                                maxLength={8}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200 text-sm animate-fade-in">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleCheckIn}
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-semibold transition-all shadow-lg disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    กำลังตรวจสอบ...
                                </span>
                            ) : (
                                'เช็คอิน'
                            )}
                        </button>

                        <button
                            onClick={() => router.push('/')}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-all border border-white/10"
                        >
                            ยกเลิก
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
