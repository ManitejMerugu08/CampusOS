# CampusOS 🎓

**CampusOS** is a premium, full-stack campus management platform designed for modern universities. It streamlines student services, faculty management, and administrative workflows through a sleek SaaS dashboard and a powerful WhatsApp AI chatbot.

---

## 🔥 Key Features

### 1. 🤖 Smart WhatsApp AI Assistant
- **Automated Workflows**: Report lost ID cards, raise support tickets, and check canteen menus directly via WhatsApp.
- **Faculty Mode**: Teachers can query student academics, fee status, and results using specific commands (e.g., `?faculty <roll_no> details`).
- **AI Fallback**: Integrated with OpenRouter/Mistral for natural language assistance when commands aren't used.

### 2. 📅 Timetable Management
- **Role-Based Views**: Students see their daily schedule with "Ongoing" and "Next" class highlights.
- **Faculty Schedules**: Teachers have a dedicated view of their teaching slots.
- **Admin Control**: Complete CRUD interface to manage classes across all departments.

### 3. 🍽️ Smart Canteen & QR Pickup
- **Menu Management**: Real-time availability toggles for items.
- **Wallet System**: Student balance management (Local Currency: ₹).
- **QR Pickup**: Secure order collection using scanned QR codes in the admin panel.

### 4. 🎫 Support Ticketing
- Multi-step ticket creation with priority levels.
- Real-time status tracking for students and resolution interface for faculty/admin.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Framer Motion, Recharts, Lucide Icons, Vanilla CSS (Premium Glassmorphism).
- **Backend**: Node.js, Express.
- **Database**: SQLite with **Prisma ORM**.
- **Integrations**: Twilio (WhatsApp), OpenRouter (AI LLM).

---

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma db push
node prisma/seed.js
npm start
```
*Create a `.env` file in the backend folder with:*
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_secret_key"
OPENROUTER_API_KEY="your_key"
TWILIO_ACCOUNT_SID="your_sid"
TWILIO_AUTH_TOKEN="your_token"
TWILIO_PHONE_NUMBER="your_whatsapp_number"
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Demo Credentials

All accounts use the password: `password123`

- **Admin**: `admin@campusos.edu`
- **Faculty**: `shilpa@faculty.campusos.edu`
- **Student**: `manitej@campusos.edu` (Roll: 2411CS070024)

---

## 📄 License
Project developed for CampusOS Academic Management.
