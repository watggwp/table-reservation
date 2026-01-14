import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const { status } = await request.json()

        // Update event status
        const event = await prisma.event.update({
            where: { id },
            data: { status },
        })

        return NextResponse.json({ event })
    } catch (error) {
        console.error('Update event error:', error)
        return NextResponse.json(
            { error: 'Failed to update event' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params

        // Delete event (cascade will handle related tables and reservations)
        await prisma.event.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Event deleted successfully' })
    } catch (error) {
        console.error('Delete event error:', error)
        return NextResponse.json(
            { error: 'Failed to delete event' },
            { status: 500 }
        )
    }
}
