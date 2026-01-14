'use client'

import { useEffect, useState } from 'react'
import { getStatusColor, getStatusText } from '@/lib/utils'

interface Table {
    id: string
    tableNo: string
    zone: string
    capacity: number
    priceOverride: number | null
    posX: number
    posY: number
    status: string
    _count?: {
        reservations: number
    }
    reservations?: Array<{
        status: string
        qty: number
    }>
}

interface SeatMapProps {
    eventId: string
    tables: Table[]
    pricePerTable: number
    onSelectTable: (table: Table) => void
}

export default function SeatMap({ eventId, tables, pricePerTable, onSelectTable }: SeatMapProps) {
    const [currentTables, setCurrentTables] = useState(tables)
    const [selectedTable, setSelectedTable] = useState<Table | null>(null)

    // Poll for updates every 5 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch(`/api/tables?eventId=${eventId}`)
                const data = await response.json()
                setCurrentTables(data.tables)
            } catch (error) {
                console.error('Failed to fetch table updates:', error)
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [eventId])

    const getTableStatus = (table: Table): string => {
        if (table.status === 'CLOSED') return 'CLOSED'

        const activeReservations = table.reservations?.filter(r =>
            ['HOLD', 'PENDING_PAYMENT', 'WAITING_APPROVAL', 'CONFIRMED'].includes(r.status)
        ) || []

        if (activeReservations.length === 0) return 'AVAILABLE'

        const totalReserved = activeReservations.reduce((sum, r) => sum + r.qty, 0)
        if (totalReserved >= table.capacity) return 'RESERVED'

        return 'HOLD'
    }

    const handleTableClick = (table: Table) => {
        const status = getTableStatus(table)
        if (status === 'AVAILABLE') {
            setSelectedTable(table)
            onSelectTable(table)
        }
    }

    return (
        <div className="w-full">
            {/* Legend */}
            <div className="mb-6 flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-white text-sm">ว่าง</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-white text-sm">กำลังจอง</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-white text-sm">เต็ม</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-500 rounded"></div>
                    <span className="text-white text-sm">ปิด</span>
                </div>
            </div>

            {/* Seat Map */}
            <div className="relative bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20 p-8" style={{ minHeight: '700px', height: '700px' }}>
                {/* Stage */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg z-10">
                    🎭 เวที
                </div>

                {/* Tables */}
                <div className="relative w-full h-full mt-16">
                    {currentTables.map((table) => {
                        const status = getTableStatus(table)
                        const isAvailable = status === 'AVAILABLE'
                        const price = table.priceOverride || pricePerTable

                        return (
                            <div
                                key={table.id}
                                className={`absolute transition-all duration-300 ${isAvailable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-70'
                                    }`}
                                style={{
                                    left: `${table.posX}%`,
                                    top: `${table.posY}%`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                                onClick={() => handleTableClick(table)}
                            >
                                <div
                                    className={`
                    w-24 h-24 rounded-full flex flex-col items-center justify-center
                    ${getStatusColor(status)} 
                    ${isAvailable ? 'hover:shadow-2xl hover:shadow-indigo-500/50' : ''}
                    ${selectedTable?.id === table.id ? 'ring-4 ring-white scale-110' : ''}
                    border-4 border-white/30 shadow-xl
                  `}
                                >
                                    <div className="text-white font-bold text-lg">{table.tableNo}</div>
                                    <div className="text-white text-xs">{table.zone}</div>
                                    <div className="text-white text-xs font-semibold mt-1">
                                        {table.capacity} ที่
                                    </div>
                                </div>
                                {isAvailable && (
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white bg-black/70 px-2 py-1 rounded">
                                        ฿{price.toLocaleString()}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Empty State */}
                {currentTables.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🪑</div>
                            <p className="text-white text-lg">ยังไม่มีโต๊ะในระบบ</p>
                            <p className="text-gray-400 text-sm">กรุณาติดต่อผู้จัดงาน</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Table Info */}
            {selectedTable && (
                <div className="mt-6 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-6 border border-indigo-400/50 animate-fade-in">
                    <h3 className="text-white font-bold text-xl mb-4">โต๊ะที่เลือก</h3>
                    <div className="grid grid-cols-2 gap-4 text-white">
                        <div>
                            <span className="text-gray-300">เลขโต๊ะ:</span>
                            <span className="ml-2 font-semibold">{selectedTable.tableNo}</span>
                        </div>
                        <div>
                            <span className="text-gray-300">โซน:</span>
                            <span className="ml-2 font-semibold">{selectedTable.zone}</span>
                        </div>
                        <div>
                            <span className="text-gray-300">จำนวนที่นั่ง:</span>
                            <span className="ml-2 font-semibold">{selectedTable.capacity} ที่</span>
                        </div>
                        <div>
                            <span className="text-gray-300">ราคา:</span>
                            <span className="ml-2 font-semibold">
                                ฿{(selectedTable.priceOverride || pricePerTable).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
