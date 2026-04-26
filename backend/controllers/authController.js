const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/database');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function register(req, res) {
  try {
    const { name, email, password, monthly_budget } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const db = getDB();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const hash = await bcrypt.hash(password, 12);
    const stmt = db.prepare(
      'INSERT INTO users (name, email, password_hash, monthly_budget) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(name, email.toLowerCase(), hash, monthly_budget || 0);

    const user = db.prepare('SELECT id, name, email, currency, monthly_budget, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = generateToken(user);

    // Seed demo transactions for new user
    seedDemoData(db, user.id);

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = getDB();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const { password_hash, ...safeUser } = user;
    const token = generateToken(safeUser);

    res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
}

function getProfile(req, res) {
  try {
    const db = getDB();
    const user = db.prepare('SELECT id, name, email, currency, monthly_budget, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

function updateProfile(req, res) {
  try {
    const { name, currency, monthly_budget } = req.body;
    const db = getDB();
    db.prepare('UPDATE users SET name = ?, currency = ?, monthly_budget = ? WHERE id = ?')
      .run(name, currency || 'USD', monthly_budget || 0, req.user.id);
    const user = db.prepare('SELECT id, name, email, currency, monthly_budget, created_at FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

function seedDemoData(db, userId) {
  const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Bills'];
  const incomeCategories = ['Salary', 'Freelance', 'Investment'];
  const now = new Date();

  const transactions = [];
  // 3 months of demo data
  for (let m = 2; m >= 0; m--) {
    const month = new Date(now.getFullYear(), now.getMonth() - m, 1);
    // Income
    transactions.push({
      title: 'Monthly Salary',
      amount: 3500 + Math.random() * 500,
      type: 'income',
      category: 'Salary',
      date: new Date(month.getFullYear(), month.getMonth(), 1).toISOString().split('T')[0]
    });
    // Expenses
    for (let i = 0; i < 12; i++) {
      const day = Math.floor(Math.random() * 28) + 1;
      transactions.push({
        title: `${categories[i % categories.length]} expense`,
        amount: Math.round((20 + Math.random() * 200) * 100) / 100,
        type: 'expense',
        category: categories[i % categories.length],
        date: new Date(month.getFullYear(), month.getMonth(), day).toISOString().split('T')[0]
      });
    }
  }

  const stmt = db.prepare(
    'INSERT INTO transactions (user_id, title, amount, type, category, date) VALUES (?, ?, ?, ?, ?, ?)'
  );
  for (const t of transactions) {
    stmt.run(userId, t.title, t.amount, t.type, t.category, t.date);
  }

  // Seed goals
  const goals = [
    { title: 'Emergency Fund', target_amount: 10000, current_amount: 3500, color: '#6366f1' },
    { title: 'New Laptop', target_amount: 1500, current_amount: 900, color: '#f59e0b' },
    { title: 'Vacation', target_amount: 3000, current_amount: 450, color: '#10b981' }
  ];
  const goalStmt = db.prepare(
    'INSERT INTO goals (user_id, title, target_amount, current_amount, color) VALUES (?, ?, ?, ?, ?)'
  );
  for (const g of goals) {
    goalStmt.run(userId, g.title, g.target_amount, g.current_amount, g.color);
  }

  // Seed watchlist
  const watchlistStmt = db.prepare('INSERT OR IGNORE INTO watchlist (user_id, symbol, type) VALUES (?, ?, ?)');
  watchlistStmt.run(userId, 'bitcoin', 'crypto');
  watchlistStmt.run(userId, 'ethereum', 'crypto');
}

module.exports = { register, login, getProfile, updateProfile };
