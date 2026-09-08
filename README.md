# Multi Account Manager

Telegram UserBot uchun Telegram Mini App yaratish kerak. Bu app orqali bir nechta Telegram akkauntlarni boshqarish va ularning statistikasini ko'rish mumkin bo'ladi.

1. KIRISH EKRANI (Login Screen)
Funksiyalar:

App birinchi marta ochilganda kod so'raladigan ekran ko'rsatilishi kerak

Kod: Mirfayz2010 (qattiq kodlangan, o'zgartirib bo'lmaydi)

Kod to'g'ri kiritilsa, asosiy interfeysga o'tish

Kod noto'g'ri bo'lsa, xatolik xabari chiqishi

UI Elementlari:

Markazda "Kodni kiriting" sarlavhasi

Pastda kod kiritish maydoni (input field)

"Kirish" tugmasi

Chiroyli gradient fon (to'q ko'k yoki binafsha ranglar)

2. ASOSIY INTERFEYS (Dashboard)
Yuqori qism:

Joriy vaqt (real-time)

Bugungi starts soni (jami)

Shu haftalik starts soni (jami)

Shu oylik starts soni (jami)

Barcha vaqtlar uchun starts soni (jami)

O'rta qism - Akkauntlar ro'yxati:

Har bir akkaunt uchun karta ko'rinishida:

Akkaunt nomi (To'liq ism)

@username

Telefon raqami (yashirin yoki to'liq)

Bugungi starts soni (raqam bilan)

Status indikatori (onlayn/oflayn - yashil/qizil doiracha)

Pastki qism:

"Asosiy akkaunt" - bitta akkaunt belgilangan (maxsus belgi yoki rang bilan ajralib turadi)

"Barcha startslarni asosiy akkauntga yuborish" tugmasi (sovga ko'rinishida - chiroyli dizaynda)

Bu tugma bosilganda barcha akkauntlardagi startslar asosiy akkauntga o'tkaziladi

Animatsiya bilan (konfetlar, yulduzchalar yoki sovga effekti)

3. AKKAUNT TARIXI EKRANI (Account History)
Qanday ochiladi:

Asosiy interfeysdagi istalgan akkaunt kartasiga bosganda ochiladi

Ekran elementlari:

Orqaga qaytish tugmasi (⬅️)

Akkaunt nomi va @username (sarlavhada)

Vaqt bo'yicha filtrlar:

"Bugun" | "Hafta" | "Oy" | "Barchasi"

Tarix ro'yxati:

Har bir yozuvda:

Vaqt (masalan: "12:30 | 15.08.2026")

"clicker'dan 0.10 starts oldim" (yoki shunga o'xshash matn)

Starts miqdori (raqam)

Tranzaksiya turi (kirim/chiqim) uchun rang kodlari

Pastki qism:

"Startslarni yechib olish" tugmasi

Bosilganda barcha startslar asosiy akkauntga o'tkaziladi

Tugma bosilganda konfirmatsiya dialogi chiqishi

Muvaffaqiyatli amalga oshirilganda notification

4. TEXNIK TALABLAR
Backend:

Python (aiogram yoki pyrogram) asosida Telegram UserBot

Ma'lumotlar bazasi (SQLite yoki PostgreSQL)

Har bir akkaunt uchun alohida session

API:

Telegram API bilan integratsiya

Har bir akkauntdan stats ma'lumotlarini olish

Startslarni hisoblash va saqlash

Frontend:

HTML/CSS/JavaScript (Telegram Mini App uchun mos)

Responsive design (mobil uchun optimallashtirilgan)

Telegram WebApp API dan foydalanish

Ma'lumotlar tuzilishi:

text
accounts: [
  {
    id: number,
    name: string,
    username: string,
    phone: string,
    is_main: boolean,
    stats: {
      today: number,
      week: number,
      month: number,
      total: number
    },
    history: [
      {
        timestamp: datetime,
        amount: number,
        type: 'earned' | 'sent' | 'received',
        description: string
      }
    ]
  }
]
5. DIZAYN TALABLARI
Ranglar: To'q ko'k (#1a1a2e) va binafsha (#16213e) gradient

Kartalar: Yumshoq soya, radiusli burchaklar (border-radius: 12px)

Shriftlar: Telegram sans-serif, yaxshi o'qiladigan

Animatsiyalar: Silliq o'tishlar (transition: 0.3s)

Sovga ko'rinishi: Yaltiroq, chiroyli tugma (gradient, yulduzcha yoki konfet effekti)

6. QO'SHIMCHA TALABLAR
Xavfsizlik: Kod faqat bir marta so'raladi, session saqlanadi

Refresh: Ma'lumotlar har 30 sekundda yangilanadi

Offline: Internet uzilganda xabarnoma chiqishi

Push notification: Muhim voqealar haqida xabar berish

7. ISHGA TUSHIRISH BOSQICHLARI
UserBot ni ishga tushirish (Python script)

Bot token orqali Mini App ni ulash

Akkauntlarni qo'shish (Telegram raqamlari orqali)

Startslarni kuzatishni boshlash

QO'SHIMCHA TAVSIYALAR
Telegram Bot: @BotFather dan bot yaratib, Mini App ni ulash

Hosting: VPS yoki cloud platform (Heroku, Railway)

Ma'lumotlar bazasi: SQLite (kichiq hajm uchun) yoki PostgreSQL

UserBot framework: Pyrogram yoki Telethon

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://multi-account-star-manager.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/eec59d4f-f903-41cb-87d7-eea7fdb5d93d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
