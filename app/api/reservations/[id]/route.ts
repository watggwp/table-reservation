import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const reservation = await prisma.reservation.findUnique({
            where: { id },
            include: {
                table: true,
                event: true,
                payments: true,
            },
        })

        if (!reservation) {
            return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
        }

        return NextResponse.json({ reservation })
    } catch (error) {
        console.error('Error fetching reservation:', error)
        return NextResponse.json({ error: 'Failed to fetch reservation' }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { status } = body

        const reservation = await prisma.reservation.update({
            where: { id },
            data: { status },
        })

        return NextResponse.json({ reservation })
    } catch (error) {
        console.error('Error updating reservation:', error)
        return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        await prisma.reservation.update({
            where: { id },
            data: { status: 'CANCELED' },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error canceling reservation:', error)
        return NextResponse.json({ error: 'Failed to cancel reservation' }, { status: 500 })
    }
}
