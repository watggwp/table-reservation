'use client'

import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Event {
    id: string
    name: string
    date: string
    location: string
    tableCapacity: number
    pricePerTable: number
    depositAmount: number
    status: string
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([])
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        location: '',
        tableCapacity: '10',
        pricePerTable: '',
        depositAmount: '',
    })

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        const response = await fetch('/api/events')
        const data = await response.json()
        setEvents(data.events)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to create event')
            }

            Swal.fire({
                icon: 'success',
                title: 'สำเร็จ!',
                text: 'สร้างงานสำเร็จ',
                confirmButtonColor: '#6366f1',
            })
            setShowForm(false)
            setFormData({
                name: '',
                date: '',
                location: '',
                tableCapacity: '10',
                pricePerTable: '',
                depositAmount: '',
            })
            fetchEvents()
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: errorMessage,
                confirmButtonColor: '#6366f1',
            })
        }
    }

    const handleToggleStatus = async (eventId: string, eventName: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'CLOSED' : 'ACTIVE'
        const actionText = newStatus === 'CLOSED' ? 'ปิดการจอง' : 'เปิดการจอง'

        const result = await Swal.fire({
            title: `ยืนยัน${actionText}?`,
            html: `คุณต้องการ${actionText}งาน "<strong>${eventName}</strong>" หรือไม่?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#64748b',
            confirmButtonText: `ใช่, ${actionText}!`,
            cancelButtonText: 'ยกเลิก',
        })

        if (!result.isConfirmed) return

        try {
            const response = await fetch(`/api/events/${eventId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to update event')
            }

            Swal.fire({
                icon: 'success',
                title: 'สำเร็จ!',
                text: `${actionText}เรียบร้อยแล้ว`,
                confirmButtonColor: '#6366f1',
            })
            fetchEvents()
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: errorMessage,
                confirmButtonColor: '#6366f1',
            })
        }
    }

    const handleDeleteEvent = async (eventId: string, eventName: string) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            html: `คุณต้องการลบงาน "<strong>${eventName}</strong>" หรือไม่?<br><small class="text-red-300">การดำเนินการนี้จะลบข้อมูลทั้งหมดออกจากฐานข้อมูล</small>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6366f1',
            confirmButtonText: 'ใช่, ลบเลย!',
            cancelButtonText: 'ยกเลิก',
        })

        if (!result.isConfirmed) return

        try {
            const response = await fetch(`/api/events/${eventId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to delete event')
            }

            Swal.fire({
                icon: 'success',
                title: 'ลบสำเร็จ!',
                text: 'ลบงานเรียบร้อยแล้ว',
                confirmButtonColor: '#6366f1',
            })
            fetchEvents()
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: errorMessage,
                confirmButtonColor: '#6366f1',
            })
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">จัดการงาน</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                    {showForm ? 'ยกเลิก' : '+ สร้างงานใหม่'}
                </button>
            </div>

            {/* Create Event Form */}
            {showForm && (
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">สร้างงานใหม่</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-white mb-2">ชื่องาน *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="งานเลี้ยงสังสรรค์"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-white mb-2">วันที่จัดงาน *</label>
                                <input
                                    type="datetime-local"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-white mb-2">สถานที่ *</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="โรงแรม ABC"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-white mb-2">จำนวนที่นั่งต่อโต๊ะ *</label>
                                <input
                                    type="number"
                                    value={formData.tableCapacity}
                                    onChange={(e) => setFormData({ ...formData, tableCapacity: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    min="1"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-white mb-2">ราคาต่อโต๊ะ (บาท) *</label>
                                <input
                                    type="number"
                                    value={formData.pricePerTable}
                                    onChange={(e) => setFormData({ ...formData, pricePerTable: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="5000"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-white mb-2">ยอดมัดจำ (บาท) *</label>
                                <input
                                    type="number"
                                    value={formData.depositAmount}
                                    onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="1000"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                        >
                            สร้างงาน
                        </button>
                    </form>
                </div>
            )}

            {/* Events List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <div
                        key={event.id}
                        className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-purple-400 transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-white">{event.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${event.status === 'ACTIVE' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                                }`}>
                                {event.status}
                            </span>
                        </div>

                        <div className="space-y-2 text-gray-300 text-sm">
                            <div>📅 {formatDate(new Date(event.date))}</div>
                            <div>📍 {event.location}</div>
                            <div>💰 {formatCurrency(event.pricePerTable)} / โต๊ะ</div>
                            <div>👥 {event.tableCapacity} ที่นั่ง / โต๊ะ</div>
                            <div>💵 มัดจำ {formatCurrency(event.depositAmount)}</div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                            <a
                                href={`/admin/tables?eventId=${event.id}`}
                                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-center text-sm font-semibold transition-all"
                            >
                                จัดการโต๊ะ
                            </a>
                            <a
                                href={`/event/${event.id}`}
                                target="_blank"
                                className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-center text-sm font-semibold transition-all"
                            >
                                ดูหน้าจอง
                            </a>
                            <button
                                onClick={() => handleToggleStatus(event.id, event.name, event.status)}
                                className={`px-3 py-2 ${event.status === 'ACTIVE'
                                        ? 'bg-orange-600 hover:bg-orange-700'
                                        : 'bg-green-600 hover:bg-green-700'
                                    } text-white rounded-lg text-sm font-semibold transition-all`}
                                title={event.status === 'ACTIVE' ? 'ปิดการจอง' : 'เปิดการจอง'}
                            >
                                {event.status === 'ACTIVE' ? '🔒' : '🔓'}
                            </button>
                            <button
                                onClick={() => handleDeleteEvent(event.id, event.name)}
                                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all"
                                title="ลบงาน"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {events.length === 0 && !showForm && (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl text-white mb-2">ยังไม่มีงานในระบบ</h2>
                    <p className="text-gray-400">คลิกปุ่ม "สร้างงานใหม่" เพื่อเริ่มต้น</p>
                </div>
            )}
        </div>
    )
}
