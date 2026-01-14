import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
    }).format(amount)
}

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date)
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        AVAILABLE: 'bg-green-500',
        RESERVED: 'bg-red-500',
        HOLD: 'bg-yellow-500',
        CLOSED: 'bg-gray-500',
        PENDING_PAYMENT: 'bg-orange-500',
        WAITING_APPROVAL: 'bg-blue-500',
        CONFIRMED: 'bg-green-600',
        CANCELED: 'bg-gray-400',
    }
    return colors[status] || 'bg-gray-300'
}

export function getStatusText(status: string): string {
    const texts: Record<string, string> = {
        HOLD: 'กำลังจอง',
        PENDING_PAYMENT: 'รอชำระเงิน',
        WAITING_APPROVAL: 'รออนุมัติ',
        CONFIRMED: 'ยืนยันแล้ว',
        CANCELED: 'ยกเลิก',
        AVAILABLE: 'ว่าง',
        RESERVED: 'จองแล้ว',
        CLOSED: 'ปิด',
    }
    return texts[status] || status
}

// Generate PromptPay QR payload
export function generatePromptPayPayload(phoneNumber: string, amount: number): string {
    // Simplified PromptPay payload generation
    // In production, use a proper library like promptpay-qr
    const payload = `00020101021129370016A000000677010111${phoneNumber.replace(/^0/, '66')}5303764540${amount.toFixed(2)}6304`
    return payload
}
