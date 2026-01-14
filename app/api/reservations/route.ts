import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { eventId, tableId, customerName, phone, qty } = body

        if (!eventId || !tableId || !customerName || !phone || !qty) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Get event and table info
        const event = await prisma.event.findUnique({ where: { id: eventId } })
        const table = await prisma.table.findUnique({
            where: { id: tableId },
            include: {
                reservations: {
                    where: {
                        status: {
                            in: ['HOLD', 'PENDING_PAYMENT', 'WAITING_APPROVAL', 'CONFIRMED']
                        }
                    }
                }
            }
        })

        if (!event || !table) {
            return NextResponse.json({ error: 'Event or table not found' }, { status: 404 })
        }

        // Check if table is available
        const totalReserved = table.reservations.reduce((sum, r) => sum + r.qty, 0)
        if (totalReserved + qty > table.capacity) {
            return NextResponse.json({ error: 'Table not available' }, { status: 400 })
        }

        // Calculate amounts
        const pricePerTable = table.priceOverride || event.pricePerTable
        const totalAmount = pricePerTable
        const depositAmount = event.depositAmount

        // Create reservation with HOLD status
        const holdExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        const reservation = await prisma.reservation.create({
            data: {
                eventId,
                tableId,
                customerName,
                phone,
                qty,
                totalAmount,
                depositAmount,
                paidAmount: 0,
                status: 'HOLD',
                holdExpiresAt,
            },
        })

        return NextResponse.json({ reservation })
    } catch (error) {
        console.error('Error creating reservation:', error)
        return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const eventId = searchParams.get('eventId')

        const where = eventId ? { eventId } : {}

        const reservations = await prisma.reservation.findMany({
            where,
            include: {
                table: true,
                event: true,
                payments: true,
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ reservations })
    } catch (error) {
        console.error('Error fetching reservations:', error)
        return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 })
    }
}
