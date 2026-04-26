const axios = require('axios');
const { getDB } = require('../config/database');

async function getAIInsights(req, res) {
  try {
    const db = getDB();
    const userId = req.user.id;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const user = db.prepare('SELECT name, monthly_budget, currency FROM users WHERE id=?').get(userId);

    const income = db.prepare(
      "SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE user_id=? AND type='income' AND strftime('%Y-%m',date)=?"
    ).get(userId, currentMonth).total;

    const expenses = db.prepare(
      "SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE user_id=? AND type='expense' AND strftime('%Y-%m',date)=?"
    ).get(userId, currentMonth).total;

    const categoryBreakdown = db.prepare(
      "SELECT category, SUM(amount) as total FROM transactions WHERE user_id=? AND type='expense' AND strftime('%Y-%m',date)=? GROUP BY category ORDER BY total DESC"
    ).all(userId, currentMonth);

    const goals = db.prepare('SELECT title, target_amount, current_amount FROM goals WHERE user_id=?').all(userId);

    const last3Months = db.prepare(`
      SELECT strftime('%Y-%m', date) as month,
        SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expenses
      FROM transactions WHERE user_id=?
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month DESC LIMIT 3
    `).all(userId);

    const financialData = {
      user: user.name,
      currency: user.currency || 'USD',
      monthlyBudget: user.monthly_budget,
      currentMonth: {
        income: Math.round(income * 100) / 100,
        expenses: Math.round(expenses * 100) / 100,
        savings: Math.round((income - expenses) * 100) / 100,
        budgetUsed: user.monthly_budget > 0 ? Math.round((expenses / user.monthly_budget) * 100) : null
      },
      categoryBreakdown: categoryBreakdown.map(c => ({ category: c.category, amount: Math.round(c.total * 100) / 100 })),
      goals: goals.map(g => ({
        title: g.title,
        progress: Math.round((g.current_amount / g.target_amount) * 100),
        remaining: Math.round((g.target_amount - g.current_amount) * 100) / 100
      })),
      trend: last3Months
    };

    const prompt = `You are a friendly, smart personal finance advisor. Analyze this user's financial data and give 3 specific, actionable insights. Be conversational, direct, and encouraging. Use concrete numbers from the data.

Financial Data:
${JSON.stringify(financialData, null, 2)}

Respond with ONLY a JSON array of exactly 3 insight objects. Each object must have:
- "type": one of "warning", "success", "tip"
- "title": short headline (max 8 words)
- "message": 1-2 sentences with specific advice using their actual numbers
- "icon": one emoji that fits

No markdown, no preamble, just the JSON array.`;

    const modelName = 'gemini-2.0-flash-001';
    const apiKey = process.env.GEMINI_API_KEY;
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + modelName + ':generateContent?key=' + apiKey;

    const response = await axios.post(
      url,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { 'Content-Type': 'application/json' } }
    );

    let insights;
    try {
      const text = response.data.candidates[0].content.parts[0].text;
      const clean = text.replace(/```json|```/g, '').trim();
      insights = JSON.parse(clean);
    } catch (parseErr) {
      insights = [
        { type: 'tip', title: 'Track your spending', message: `You've spent $${Math.round(expenses)} this month. Keep logging transactions to see patterns.`, icon: '📊' },
        { type: 'success', title: 'Good saving habits', message: `Your savings rate this month is ${income > 0 ? Math.round(((income - expenses) / income) * 100) : 0}%. Keep it up!`, icon: '✨' },
        { type: 'tip', title: 'Set financial goals', message: 'Consider setting specific savings goals to stay motivated and on track.', icon: '🎯' }
      ];
    }

    res.json({ insights, financialSnapshot: financialData.currentMonth });
  } catch (err) {
    console.error('AI insights error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to generate insights.' });
  }
}

module.exports = { getAIInsights };