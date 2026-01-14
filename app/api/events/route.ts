import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
    try {
        const events = await prisma.event.findMany({
            orderBy: { date: 'desc' }
        })

        return NextResponse.json({ events })
    } catch (error) {
        console.error('Error fetching events:', error)
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, date, location, tableCapacity, pricePerTable, depositAmount } = body

        if (!name || !date || !location || !tableCapacity || !pricePerTable || !depositAmount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const event = await prisma.event.create({
            data: {
                name,
                date: new Date(date),
                location,
                tableCapacity: parseInt(tableCapacity),
                pricePerTable: parseFloat(pricePerTable),
                depositAmount: parseFloat(depositAmount),
                status: 'ACTIVE',
            },
        })

        return NextResponse.json({ event })
    } catch (error) {
        console.error('Error creating event:', error)
        return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
    }
}
