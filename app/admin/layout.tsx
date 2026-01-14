import Link from 'next/link'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen">
            {/* Admin Header */}
            <header className="bg-gradient-to-r from-purple-900 to-pink-900 border-b border-white/20">
                <div className="max-w-7xl mx-auto px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">🔐 Admin Panel</h1>
                            <p className="text-gray-300 text-sm">ระบบจัดการงานและการจอง</p>
                        </div>
                        <Link
                            href="/"
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                        >
                            ← กลับหน้าหลัก
                        </Link>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white/5 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex gap-1">
                        <Link
                            href="/admin"
                            className="px-6 py-3 text-white hover:bg-white/10 transition-all border-b-2 border-transparent hover:border-purple-400"
                        >
                            📊 Dashboard
                        </Link>
                        <Link
                            href="/admin/events"
                            className="px-6 py-3 text-white hover:bg-white/10 transition-all border-b-2 border-transparent hover:border-purple-400"
                        >
                            🎉 จัดการงาน
                        </Link>
                        <Link
                            href="/admin/tables"
                            className="px-6 py-3 text-white hover:bg-white/10 transition-all border-b-2 border-transparent hover:border-purple-400"
                        >
                            🪑 จัดการโต๊ะ
                        </Link>
                        <Link
                            href="/admin/reservations"
                            className="px-6 py-3 text-white hover:bg-white/10 transition-all border-b-2 border-transparent hover:border-purple-400"
                        >
                            📝 การจอง
                        </Link>
                        <Link
                            href="/admin/reports"
                            className="px-6 py-3 text-white hover:bg-white/10 transition-all border-b-2 border-transparent hover:border-purple-400"
                        >
                            📈 รายงาน
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-8 py-8">
                {children}
            </main>
        </div>
    )
}
