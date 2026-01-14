import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { reservationId, amount, slipData } = body

        if (!reservationId || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Save slip image if provided
        let slipUrl = null
        if (slipData) {
            const base64Data = slipData.replace(/^data:image\/\w+;base64,/, '')
            const buffer = Buffer.from(base64Data, 'base64')
            const filename = `slip-${Date.now()}.png`
            const filepath = join(process.cwd(), 'public', 'slips', filename)

            // Create directory if it doesn't exist
            try {
                await writeFile(filepath, buffer)
                slipUrl = `/slips/${filename}`
            } catch (error) {
                console.error('Error saving slip:', error)
            }
        }

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                reservationId,
                method: 'PROMPTPAY',
                amount,
                slipUrl,
                verifyStatus: 'PENDING',
            },
        })

        // Update reservation status
        await prisma.reservation.update({
            where: { id: reservationId },
            data: {
                status: 'WAITING_APPROVAL',
                paidAmount: amount,
            },
        })

        return NextResponse.json({ payment })
    } catch (error) {
        console.error('Error creating payment:', error)
        return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json()
        const { paymentId, verifyStatus } = body

        if (!paymentId || !verifyStatus) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const payment = await prisma.payment.update({
            where: { id: paymentId },
            data: { verifyStatus },
            include: { reservation: true },
        })

        // Update reservation status based on payment verification
        if (verifyStatus === 'APPROVED') {
            await prisma.reservation.update({
                where: { id: payment.reservationId },
                data: { status: 'CONFIRMED' },
            })
        } else if (verifyStatus === 'REJECTED') {
            await prisma.reservation.update({
                where: { id: payment.reservationId },
                data: {
                    status: 'CANCELED',
                    paidAmount: 0,
                },
            })
        }

        return NextResponse.json({ payment })
    } catch (error) {
        console.error('Error updating payment:', error)
        return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
    }
}
