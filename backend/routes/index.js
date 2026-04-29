const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { getTransactions, createTransaction, updateTransaction, deleteTransaction, getSummary } = require('../controllers/transactionController');
const { getGoals, createGoal, updateGoal, deleteGoal } = require('../controllers/goalsController');

// Auth routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/profile', auth, getProfile);
router.put('/auth/profile', auth, updateProfile);

// Transaction routes
router.get('/transactions', auth, getTransactions);
router.post('/transactions', auth, createTransaction);
router.put('/transactions/:id', auth, updateTransaction);
router.delete('/transactions/:id', auth, deleteTransaction);
router.get('/transactions/summary', auth, getSummary);

// Goals routes
router.get('/goals', auth, getGoals);
router.post('/goals', auth, createGoal);
router.put('/goals/:id', auth, updateGoal);
router.delete('/goals/:id', auth, deleteGoal);

module.exports = router;
