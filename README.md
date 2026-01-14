# 🎉 ระบบจองโต๊ะงานอีเวนต์ (Table Reservation System)

ระบบจองโต๊ะสำหรับงานอีเวนต์ที่ทันสมัย พร้อมระบบชำระเงิน การจัดผังโต๊ะ และการเช็คอิน

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)

## ✨ ฟีเจอร์หลัก

### 👥 สำหรับลูกค้า
- 📅 **ดูรายการงาน** - แสดงงานที่เปิดจองทั้งหมด
- 🪑 **เลือกโต๊ะ** - ดูผังโต๊ะแบบ real-time พร้อมสถานะ
- 💳 **ชำระเงินมัดจำ** - QR Code PromptPay + อัพโหลดสลิป
- ✅ **ยืนยันการจอง** - รับ QR Code สำหรับเช็คอิน
- 🎫 **เช็คอิน** - สแกน QR Code หรือใส่รหัสจอง

### 🔧 สำหรับแอดมิน
- 🎪 **จัดการงาน** - สร้าง, แก้ไข, ปิด/เปิดการจอง, ลบงาน
- 🗺️ **จัดผังโต๊ะ** - Drag & Drop โต๊ะได้อิสระ
- 📋 **จัดการการจอง** - อนุมัติ/ปฏิเสธการชำระเงิน
- 📊 **รายงาน** - สรุปยอดขาย, Export CSV
- 👤 **จัดการเช็คอิน** - ดูรายชื่อผู้เข้างาน

## 📸 System Preview

<p align="center">
  <img src="./images/preview-1.png" width="340" />
  <img src="./images/preview-2.png" width="340" />
</p>

<p align="center">
  <img src="./images/preview-3.png" width="340" />
  <img src="./images/preview-4.png" width="340" />
</p>

<p align="center">
  <img src="./images/preview-5.png" width="340" />
  <img src="./images/preview-6.png" width="340" />
</p>

<p align="center">
  <img src="./images/preview-7.png" width="340" />
  <img src="./images/preview-8.png" width="340" />
</p>

<p align="center">
  <img src="./images/preview-9.png" width="340" />
  <img src="./images/preview-10.png" width="340" />
</p>

<p align="center">
  <img src="./images/preview-11.png" width="340" />
  <img src="./images/preview-12.png" width="340" />
</p>

<p align="center">
  <img src="./images/preview-13.png" width="340" />
  <img src="./images/preview-14.png" width="340" />
</p>


## 🚀 เทคโนโลยีที่ใช้

- **Frontend**: Next.js 16.1.1 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, SweetAlert2
- **Backend**: Next.js API Routes
- **Database**: SQLite + Prisma ORM
- **QR Code**: qrcode library
- **Animations**: Custom CSS animations

## 📋 ความต้องการของระบบ

- Node.js 18.0 หรือสูงกว่า
- npm หรือ yarn
- Git (สำหรับ clone โปรเจค)

## 🛠️ การติดตั้ง

### 1. Clone โปรเจค

```bash
git clone <repository-url>
cd table-reservation
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์หลัก:

```env
DATABASE_URL="file:./dev.db"
```

### 4. ตั้งค่าฐานข้อมูล

```bash
# สร้างฐานข้อมูลและตาราง
npx prisma migrate dev --name init

# (Optional) เปิด Prisma Studio เพื่อดูข้อมูล
npx prisma studio
```

### 5. รันโปรเจค

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ http://localhost:3000

## � โครงสร้างโปรเจค

```
table-reservation/
├── app/                          # Next.js App Router
│   ├── admin/                    # หน้าแอดมิน
│   │   ├── events/              # จัดการงาน
│   │   ├── tables/              # จัดผังโต๊ะ
│   │   ├── reservations/        # จัดการการจอง
│   │   └── reports/             # รายงาน
│   ├── event/[id]/              # หน้าจองของลูกค้า
│   │   ├── payment/             # ชำระเงิน
│   │   └── confirmation/        # ยืนยันการจอง
│   ├── checkin/                 # หน้าเช็คอิน
│   ├── api/                     # API Routes
│   │   ├── events/              # API งาน
│   │   ├── tables/              # API โต๊ะ
│   │   ├── reservations/        # API การจอง
│   │   ├── payments/            # API การชำระเงิน
│   │   └── checkin/             # API เช็คอิน
│   ├── globals.css              # Global styles
│   └── layout.tsx               # Root layout
├── components/                   # React Components
│   └── SeatMap.tsx              # Component แสดงผังโต๊ะ
├── lib/                         # Utilities
│   ├── db.ts                    # Prisma client
│   └── utils.ts                 # Helper functions
├── prisma/                      # Prisma schema & migrations
│   └── schema.prisma            # Database schema
└── public/                      # Static files
```

## 🎯 การใช้งาน

### สำหรับแอดมิน

1. **เข้าสู่ระบบแอดมิน**: http://localhost:3000/admin
2. **สร้างงาน**: คลิก "+ สร้างงานใหม่"
3. **จัดผังโต๊ะ**: เลือกงาน → คลิก "จัดการโต๊ะ" → เพิ่มโต๊ะและลากจัดตำแหน่ง
4. **จัดการการจอง**: ไปที่ "จัดการการจอง" → อนุมัติ/ปฏิเสธการชำระเงิน

### สำหรับลูกค้า

1. **เลือกงาน**: http://localhost:3000
2. **เลือกโต๊ะ**: คลิกที่โต๊ะว่าง (สีเขียว)
3. **กรอกข้อมูล**: ใส่ชื่อและเบอร์โทร
4. **ชำระเงิน**: สแกน QR Code และอัพโหลดสลิป
5. **รับ QR Code**: เก็บไว้สำหรับเช็คอิน

## 🎨 ธีมสี

- **Primary**: Indigo (#6366f1) → Purple (#9333ea)
- **Success**: Emerald (#10b981) → Green (#22c55e)
- **Warning**: Yellow (#eab308)
- **Danger**: Red (#ef4444)
- **Background**: Slate (#0f172a) → Indigo (#312e81)

## � Database Schema

### Event (งาน)
- ชื่องาน, วันที่, สถานที่
- ราคาต่อโต๊ะ, มัดจำ
- สถานะ: ACTIVE, CLOSED

### Table (โต๊ะ)
- เลขโต๊ะ, โซน, จำนวนที่นั่ง
- ตำแหน่ง (posX, posY)
- สถานะ: OPEN, CLOSED

### Reservation (การจอง)
- ข้อมูลลูกค้า (ชื่อ, เบอร์โทร)
- จำนวนที่นั่ง, ยอดเงิน
- สถานะ: HOLD, PENDING_PAYMENT, WAITING_APPROVAL, CONFIRMED, CANCELED

### Payment (การชำระเงิน)
- วิธีชำระ: PROMPTPAY, CASH
- URL สลิป
- สถานะ: PENDING, APPROVED, REJECTED

### CheckIn (เช็คอิน)
- เวลาเช็คอิน
- ผู้เช็คอิน

## 🔧 คำสั่งที่ใช้บ่อย

```bash
# Development
npm run dev              # รันโปรเจค (dev mode)
npm run build           # Build สำหรับ production
npm start               # รัน production build

# Database
npx prisma studio       # เปิด Prisma Studio
npx prisma migrate dev  # สร้าง migration ใหม่
npx prisma generate     # Generate Prisma Client
npx prisma db push      # Push schema โดยไม่สร้าง migration

# Git
git add .               # เพิ่มไฟล์ทั้งหมด
git commit -m "message" # Commit
git push                # Push ขึ้น remote
```

## � การแก้ปัญหา

### ปัญหา: Database connection error
```bash
# ลบฐานข้อมูลและสร้างใหม่
rm prisma/dev.db
npx prisma migrate dev --name init
```

### ปัญหา: Port 3000 ถูกใช้งาน
```bash
# ใช้ port อื่น
npm run dev -- -p 3001
```

### ปัญหา: Module not found
```bash
# ติดตั้ง dependencies ใหม่
rm -rf node_modules package-lock.json
npm install
```

## 🚀 การ Deploy

### Vercel (แนะนำ)

1. Push โค้ดขึ้น GitHub
2. เข้า [Vercel](https://vercel.com)
3. Import โปรเจค
4. ตั้งค่า Environment Variables
5. Deploy!

### Railway

1. Push โค้ดขึ้น GitHub
2. เข้า [Railway](https://railway.app)
3. New Project → Deploy from GitHub
4. เลือก repository
5. Deploy!

## 📝 License

MIT License - ใช้งานได้อย่างอิสระ

## 👨‍💻 ผู้พัฒนา

พัฒนาด้วย ❤️ โดยใช้ Next.js และ Prisma

## 🙏 Credits

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [SweetAlert2](https://sweetalert2.github.io/)
- [QRCode](https://github.com/soldair/node-qrcode)

---

**หมายเหตุ**: โปรเจคนี้ใช้ SQLite สำหรับ development หากต้องการใช้งานจริง แนะนำให้เปลี่ยนเป็น PostgreSQL หรือ MySQL
