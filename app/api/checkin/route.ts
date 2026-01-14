import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const { reservationId } = await request.json()

        if (!reservationId) {
            return NextResponse.json({ error: 'Missing reservationId' }, { status: 400 })
        }

        // Check if reservation exists and is confirmed
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
        })

        if (!reservation) {
            return NextResponse.json({ error: 'ไม่พบการจองนี้' }, { status: 404 })
        }

        if (reservation.status !== 'CONFIRMED') {
            return NextResponse.json({ error: 'การจองนี้ยังไม่ได้รับการยืนยัน' }, { status: 400 })
        }

        // Check if already checked in
        const existingCheckIn = await prisma.checkIn.findFirst({
            where: { reservationId },
        })

        if (existingCheckIn) {
            return NextResponse.json({
                error: 'เช็คอินแล้ว',
                checkIn: existingCheckIn
            }, { status: 400 })
        }

        // Create check-in record
        const checkIn = await prisma.checkIn.create({
            data: {
                reservationId,
                checkedInAt: new Date(),
            },
        })

        return NextResponse.json({ checkIn })
    } catch (error) {
        console.error('Check-in error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// Get check-in status
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const reservationId = searchParams.get('reservationId')

        if (!reservationId) {
            return NextResponse.json({ error: 'Missing reservationId' }, { status: 400 })
        }

        const checkIn = await prisma.checkIn.findFirst({
            where: { reservationId },
            include: {
                reservation: {
                    include: {
                        table: true,
                        event: true,
                    },
                },
            },
        })

        if (!checkIn) {
            return NextResponse.json({ error: 'ยังไม่ได้เช็คอิน' }, { status: 404 })
        }

        return NextResponse.json({ checkIn })
    } catch (error) {
        console.error('Get check-in error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
