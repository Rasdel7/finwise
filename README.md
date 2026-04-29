# 💎 FinWise — Personal Finance Dashboard (INR)

A full-stack personal finance web app with expense tracking, savings goals, and beautiful data visualizations. Customized for Indian Rupee (₹).

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Recharts, React Router v6  
**Backend:** Node.js, Express, SQLite (better-sqlite3), JWT Auth, bcrypt  

## Features

- 🔐 JWT Authentication (register/login/logout)
- 📊 Dashboard with income/expense charts and spending breakdown
- 💳 Full transactions CRUD (add, edit, delete, filter)
- 🎯 Savings goals with progress tracking
- 💰 All values in Indian Rupees (₹)
- 🌱 Auto-seeded demo data for new users

---

## Local Setup

### Prerequisites
- Node.js v18+
- npm

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd finwise
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5001
JWT_SECRET=any_long_random_string_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Start backend:
```bash
npm run dev
```
You should see: `🚀 FinWise backend running on http://localhost:5001`

### 3. Frontend Setup

Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```

Visit: **http://localhost:3000**

---

Built with ❤️ for personal finance management.
