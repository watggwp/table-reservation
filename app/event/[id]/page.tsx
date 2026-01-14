import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import SeatMapClient from './SeatMapClient'

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const event = await prisma.event.findUnique({
        where: { id },
        include: {
            tables: {
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
                }
            }
        }
    })

    if (!event) {
        notFound()
    }

    return <SeatMapClient event={event} />
}
