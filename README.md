# 💎 FinWise — Personal Finance Dashboard

A full-stack personal finance web app with AI-powered insights, real-time crypto prices, expense tracking, savings goals, and beautiful data visualizations.

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Recharts, React Router v6  
**Backend:** Node.js, Express, SQLite (better-sqlite3), JWT Auth, bcrypt  
**APIs:** Anthropic Claude (AI insights), CoinGecko (live crypto prices)  
**Deployment:** Vercel (frontend) + Render (backend)

## Features

- 🔐 JWT Authentication (register/login/logout)
- 📊 Dashboard with income/expense charts and spending breakdown
- 💳 Full transactions CRUD (add, edit, delete, filter)
- 🎯 Savings goals with progress tracking
- 📈 Live crypto market data with personal watchlist
- 🤖 AI-powered financial insights via Claude API
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
PORT=5000
JWT_SECRET=any_long_random_string_here
JWT_EXPIRES_IN=7d
ANTHROPIC_API_KEY=sk-ant-...   # from console.anthropic.com
NODE_ENV=development
```

Start backend:
```bash
npm run dev
```
You should see: `🚀 FinWise backend running on http://localhost:5000`

### 3. Frontend Setup

Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```

Visit: **http://localhost:3000**

### 4. Test It

1. Click **Create Account** and register
2. Demo data is auto-loaded (3 months of transactions + goals)
3. Go to **AI Insights** and click **Generate My Insights**

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/profile | Yes | Get profile |
| GET | /api/transactions | Yes | List transactions |
| POST | /api/transactions | Yes | Add transaction |
| PUT | /api/transactions/:id | Yes | Update transaction |
| DELETE | /api/transactions/:id | Yes | Delete transaction |
| GET | /api/transactions/summary | Yes | Monthly summary + chart data |
| GET | /api/goals | Yes | List goals |
| POST | /api/goals | Yes | Create goal |
| PUT | /api/goals/:id | Yes | Update goal |
| DELETE | /api/goals/:id | Yes | Delete goal |
| GET | /api/market | Yes | Top 10 cryptos |
| GET | /api/market/watchlist | Yes | User watchlist |
| POST | /api/market/watchlist | Yes | Add to watchlist |
| DELETE | /api/market/watchlist/:symbol | Yes | Remove from watchlist |
| GET | /api/ai/insights | Yes | AI financial insights |

---

## Deployment

### Backend → Render.com
1. Push to GitHub
2. Create new **Web Service** on Render
3. Set root directory to `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add all environment variables from `.env`

### Frontend → Vercel
1. Create new project on Vercel
2. Set root directory to `frontend`
3. Add env variable: `VITE_API_URL=https://your-render-url.onrender.com/api`
4. Update `frontend/src/utils/api.js` baseURL to use `import.meta.env.VITE_API_URL`
5. Update CORS in `backend/server.js` with your Vercel domain

---

## Project Structure

```
finwise/
├── backend/
│   ├── config/database.js      # SQLite setup & schema
│   ├── controllers/
│   │   ├── authController.js   # Register, login, profile
│   │   ├── transactionController.js
│   │   ├── goalsController.js
│   │   ├── marketController.js # CoinGecko integration
│   │   └── aiController.js     # Claude AI integration
│   ├── middleware/auth.js       # JWT middleware
│   ├── routes/index.js          # All API routes
│   └── server.js               # Express entry point
└── frontend/
    └── src/
        ├── components/layout/Sidebar.jsx
        ├── context/AuthContext.jsx
        ├── pages/
        │   ├── AuthPage.jsx
        │   ├── Dashboard.jsx
        │   ├── Transactions.jsx
        │   ├── Goals.jsx
        │   ├── Markets.jsx
        │   └── Insights.jsx
        └── utils/api.js
```

---

Built with ❤️ as a portfolio project by Jyotiraditya
