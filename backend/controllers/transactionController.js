const { getDB } = require('../config/database');

function getTransactions(req, res) {
  try {
    const db = getDB();
    const { type, category, limit = 50, offset = 0, month } = req.query;

    let query = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [req.user.id];

    if (type) { query += ' AND type = ?'; params.push(type); }
    if (category) { query += ' AND category = ?'; params.push(category); }
    if (month) { query += ' AND strftime("%Y-%m", date) = ?'; params.push(month); }

    query += ' ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const transactions = db.prepare(query).all(...params);
    const total = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE user_id = ?').get(req.user.id).count;

    res.json({ transactions, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
}

function createTransaction(req, res) {
  try {
    const { title, amount, type, category, date, note } = req.body;

    if (!title || !amount || !type || !category || !date) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const db = getDB();
    const result = db.prepare(
      'INSERT INTO transactions (user_id, title, amount, type, category, date, note) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(req.user.id, title, parseFloat(amount), type, category, date, note || null);

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create transaction.' });
  }
}

function updateTransaction(req, res) {
  try {
    const { id } = req.params;
    const { title, amount, type, category, date, note } = req.body;

    const db = getDB();
    const existing = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Transaction not found.' });

    db.prepare(
      'UPDATE transactions SET title=?, amount=?, type=?, category=?, date=?, note=? WHERE id=?'
    ).run(title, parseFloat(amount), type, category, date, note || null, id);

    const updated = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update transaction.' });
  }
}

function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    const db = getDB();
    const existing = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Transaction not found.' });

    db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
    res.json({ message: 'Transaction deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete transaction.' });
  }
}

function getSummary(req, res) {
  try {
    const db = getDB();
    const userId = req.user.id;
    const { month } = req.query;

    const monthFilter = month || new Date().toISOString().slice(0, 7);

    const income = db.prepare(
      "SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE user_id=? AND type='income' AND strftime('%Y-%m',date)=?"
    ).get(userId, monthFilter).total;

    const expenses = db.prepare(
      "SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE user_id=? AND type='expense' AND strftime('%Y-%m',date)=?"
    ).get(userId, monthFilter).total;

    const categoryBreakdown = db.prepare(
      "SELECT category, SUM(amount) as total FROM transactions WHERE user_id=? AND type='expense' AND strftime('%Y-%m',date)=? GROUP BY category ORDER BY total DESC"
    ).all(userId, monthFilter);

    // Last 6 months trend
    const trend = db.prepare(`
      SELECT strftime('%Y-%m', date) as month,
        SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expenses
      FROM transactions
      WHERE user_id=?
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month DESC
      LIMIT 6
    `).all(userId).reverse();

    const budget = db.prepare('SELECT monthly_budget FROM users WHERE id=?').get(userId).monthly_budget;

    res.json({
      income,
      expenses,
      savings: income - expenses,
      budget,
      budgetUsed: budget > 0 ? (expenses / budget) * 100 : 0,
      categoryBreakdown,
      trend
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch summary.' });
  }
}

module.exports = { getTransactions, createTransaction, updateTransaction, deleteTransaction, getSummary };
