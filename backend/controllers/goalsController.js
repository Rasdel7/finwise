const { getDB } = require('../config/database');

function getGoals(req, res) {
  const db = getDB();
  const goals = db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(goals);
}

function createGoal(req, res) {
  try {
    const { title, target_amount, current_amount, deadline, color } = req.body;
    if (!title || !target_amount) return res.status(400).json({ error: 'Title and target amount required.' });

    const db = getDB();
    const result = db.prepare(
      'INSERT INTO goals (user_id, title, target_amount, current_amount, deadline, color) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(req.user.id, title, parseFloat(target_amount), parseFloat(current_amount || 0), deadline || null, color || '#6366f1');

    const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create goal.' });
  }
}

function updateGoal(req, res) {
  try {
    const { id } = req.params;
    const { title, target_amount, current_amount, deadline, color } = req.body;
    const db = getDB();

    const existing = db.prepare('SELECT * FROM goals WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Goal not found.' });

    db.prepare(
      'UPDATE goals SET title=?, target_amount=?, current_amount=?, deadline=?, color=? WHERE id=?'
    ).run(title, parseFloat(target_amount), parseFloat(current_amount || 0), deadline || null, color || '#6366f1', id);

    const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update goal.' });
  }
}

function deleteGoal(req, res) {
  const db = getDB();
  const existing = db.prepare('SELECT * FROM goals WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Goal not found.' });
  db.prepare('DELETE FROM goals WHERE id = ?').run(req.params.id);
  res.json({ message: 'Goal deleted.' });
}

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };
