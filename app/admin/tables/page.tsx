'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Swal from 'sweetalert2'

interface Table {
    tableNo: string
    zone: string
    capacity: number
    priceOverride?: number
    posX: number
    posY: number
}

interface Event {
    id: string
    name: string
    tableCapacity: number
    pricePerTable: number
}

export default function TablesPage() {
    const searchParams = useSearchParams()
    const eventId = searchParams.get('eventId')

    const [events, setEvents] = useState<Event[]>([])
    const [selectedEventId, setSelectedEventId] = useState(eventId || '')
    const [tables, setTables] = useState<Table[]>([])
    const [editingTable, setEditingTable] = useState<Table | null>(null)

    useEffect(() => {
        fetchEvents()
    }, [])

    useEffect(() => {
        if (selectedEventId) {
            fetchTables()
        }
    }, [selectedEventId])

    const fetchEvents = async () => {
        const response = await fetch('/api/events')
        const data = await response.json()
        setEvents(data.events)
    }

    const fetchTables = async () => {
        const response = await fetch(`/api/tables?eventId=${selectedEventId}`)
        const data = await response.json()
        setTables(data.tables.map((t: {
            tableNo: string
            zone: string
            capacity: number
            priceOverride: number | null
            posX: number
            posY: number
        }) => ({
            tableNo: t.tableNo,
            zone: t.zone,
            capacity: t.capacity,
            priceOverride: t.priceOverride || undefined,
            posX: t.posX,
            posY: t.posY,
        })))
    }

    const addTable = () => {
        const tableNo = `T${tables.length + 1}`
        const newTable: Table = {
            tableNo,
            zone: 'General',
            capacity: events.find(e => e.id === selectedEventId)?.tableCapacity || 10,
            posX: 20 + (tables.length % 5) * 15,
            posY: 20 + Math.floor(tables.length / 5) * 20,
        }
        setTables([...tables, newTable])
    }

    const removeTable = (index: number) => {
        setTables(tables.filter((_, i) => i !== index))
    }

    const updateTable = (index: number, updates: Partial<Table>) => {
        const newTables = [...tables]
        newTables[index] = { ...newTables[index], ...updates }
        setTables(newTables)
    }

    const saveTables = async () => {
        if (!selectedEventId) return

        try {
            const response = await fetch('/api/tables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId: selectedEventId,
                    tables,
                }),
            })

            if (!response.ok) throw new Error('Failed to save tables')

            Swal.fire({
                icon: 'success',
                title: 'สำเร็จ!',
                text: 'บันทึกผังโต๊ะสำเร็จ',
                confirmButtonColor: '#6366f1',
            })
            fetchTables()
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถบันทึกผังโต๊ะได้',
                confirmButtonColor: '#6366f1',
            })
        }
    }

    const selectedEvent = events.find(e => e.id === selectedEventId)

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-8">จัดการโต๊ะ</h1>

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

            {selectedEventId && selectedEvent && (
                <>
                    {/* Controls */}
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={addTable}
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
                        >
                            + เพิ่มโต๊ะ
                        </button>
                        <button
                            onClick={saveTables}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                        >
                            💾 บันทึกผังโต๊ะ
                        </button>
                        <div className="flex-1"></div>
                        <div className="text-white">
                            <span className="text-gray-300">โต๊ะทั้งหมด:</span>
                            <span className="ml-2 font-bold text-2xl">{tables.length}</span>
                        </div>
                    </div>

                    {/* Table Designer */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Canvas */}
                        <div className="lg:col-span-2">
                            <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/20 p-8 relative" style={{ minHeight: '700px', height: '700px' }}>
                                {/* Stage */}
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg z-10">
                                    🎭 เวที
                                </div>

                                {/* Tables */}
                                <div className="relative w-full h-full mt-16" id="table-canvas">
                                    {tables.map((table, index) => (
                                        <div
                                            key={index}
                                            className="absolute cursor-move hover:scale-110 transition-transform"
                                            style={{
                                                left: `${table.posX}%`,
                                                top: `${table.posY}%`,
                                                transform: 'translate(-50%, -50%)',
                                            }}
                                            draggable
                                            onDragStart={(e) => {
                                                e.dataTransfer.effectAllowed = 'move'
                                                // Add a transparent drag image
                                                const img = new Image()
                                                img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
                                                e.dataTransfer.setDragImage(img, 0, 0)
                                            }}
                                            onDragEnd={(e) => {
                                                const canvas = document.getElementById('table-canvas')
                                                if (!canvas) return
                                                const rect = canvas.getBoundingClientRect()
                                                const x = ((e.clientX - rect.left) / rect.width) * 100
                                                const y = ((e.clientY - rect.top) / rect.height) * 100
                                                if (x > 0 && y > 0 && x < 100 && y < 100) {
                                                    updateTable(index, {
                                                        posX: Math.max(5, Math.min(95, x)),
                                                        posY: Math.max(5, Math.min(95, y))
                                                    })
                                                }
                                            }}
                                            onClick={() => setEditingTable(table)}
                                        >
                                            <div className="w-24 h-24 rounded-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500 to-green-600 border-4 border-white/30 shadow-xl hover:shadow-2xl">
                                                <div className="text-white font-bold text-lg">{table.tableNo}</div>
                                                <div className="text-white text-xs">{table.zone}</div>
                                                <div className="text-white text-xs font-semibold mt-1">
                                                    {table.capacity} ที่
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    removeTable(index)
                                                }}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold shadow-lg"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Table List & Editor */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 max-h-[600px] overflow-y-auto">
                            <h3 className="text-white font-bold text-lg mb-4">รายการโต๊ะ</h3>

                            {tables.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    คลิก "+ เพิ่มโต๊ะ" เพื่อเริ่มต้น
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {tables.map((table, index) => (
                                        <div
                                            key={index}
                                            className={`p-4 rounded-lg border transition-all cursor-pointer ${editingTable === table
                                                ? 'bg-purple-600/30 border-purple-400'
                                                : 'bg-white/5 border-white/10 hover:border-white/30'
                                                }`}
                                            onClick={() => setEditingTable(table)}
                                        >
                                            <div className="space-y-2">
                                                <div>
                                                    <label className="text-gray-300 text-xs">เลขโต๊ะ</label>
                                                    <input
                                                        type="text"
                                                        value={table.tableNo}
                                                        onChange={(e) => updateTable(index, { tableNo: e.target.value })}
                                                        className="w-full mt-1 px-3 py-2 rounded bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-gray-300 text-xs">โซน</label>
                                                    <input
                                                        type="text"
                                                        value={table.zone}
                                                        onChange={(e) => updateTable(index, { zone: e.target.value })}
                                                        className="w-full mt-1 px-3 py-2 rounded bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-gray-300 text-xs">จำนวนที่นั่ง</label>
                                                    <input
                                                        type="number"
                                                        value={table.capacity}
                                                        onChange={(e) => updateTable(index, { capacity: parseInt(e.target.value) })}
                                                        className="w-full mt-1 px-3 py-2 rounded bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        onClick={(e) => e.stopPropagation()}
                                                        min="1"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-gray-300 text-xs">ราคาพิเศษ (ถ้ามี)</label>
                                                    <input
                                                        type="number"
                                                        value={table.priceOverride || ''}
                                                        onChange={(e) => updateTable(index, { priceOverride: e.target.value ? parseFloat(e.target.value) : undefined })}
                                                        className="w-full mt-1 px-3 py-2 rounded bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        onClick={(e) => e.stopPropagation()}
                                                        placeholder={`ราคาปกติ: ${selectedEvent.pricePerTable}`}
                                                        min="0"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {!selectedEventId && (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">🪑</div>
                    <h2 className="text-2xl text-white mb-2">เลือกงานเพื่อจัดการโต๊ะ</h2>
                    <p className="text-gray-400">กรุณาเลือกงานจากเมนูด้านบน</p>
                </div>
            )}
        </div>
    )
}
