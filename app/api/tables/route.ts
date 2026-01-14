import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const eventId = searchParams.get('eventId')

        if (!eventId) {
            return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
        }

        const tables = await prisma.table.findMany({
            where: { eventId },
            include: {
                reservations: {
                    where: {
                        status: {
                            in: ['HOLD', 'PENDING_PAYMENT', 'WAITING_APPROVAL', 'CONFIRMED']
                        }
                    },
                    select: {
                        status: true,
                        qty: true,
                    }
                }
            },
            orderBy: { tableNo: 'asc' }
        })

        return NextResponse.json({ tables })
    } catch (error) {
        console.error('Error fetching tables:', error)
        return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { eventId, tables } = body

        if (!eventId || !tables || !Array.isArray(tables)) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
        }

        // Delete existing tables and create new ones
        await prisma.table.deleteMany({ where: { eventId } })

        const createdTables = await prisma.table.createMany({
            data: tables.map((table: {
                tableNo: string
                zone: string
                capacity: number
                priceOverride?: number
                posX: number
                posY: number
            }) => ({
                eventId,
                tableNo: table.tableNo,
                zone: table.zone || 'General',
                capacity: table.capacity,
                priceOverride: table.priceOverride,
                posX: table.posX,
                posY: table.posY,
                status: 'OPEN',
            }))
        })

        return NextResponse.json({ success: true, count: createdTables.count })
    } catch (error) {
        console.error('Error creating tables:', error)
        return NextResponse.json({ error: 'Failed to create tables' }, { status: 500 })
    }
}
