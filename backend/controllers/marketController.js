const axios = require('axios');
const { getDB } = require('../config/database');

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// Simple in-memory cache to avoid rate limiting
const cache = {};
function getCached(key, ttlSeconds = 60) {
  const entry = cache[key];
  if (entry && Date.now() - entry.time < ttlSeconds * 1000) return entry.data;
  return null;
}
function setCache(key, data) {
  cache[key] = { data, time: Date.now() };
}

async function getMarketData(req, res) {
  try {
    const cacheKey = 'market_top10';
    let data = getCached(cacheKey, 120);

    if (!data) {
      const response = await axios.get(`${COINGECKO_BASE}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 10,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        }
      });
      data = response.data;
      setCache(cacheKey, data);
    }

    res.json(data);
  } catch (err) {
    console.error('Market data error:', err.message);
    res.status(500).json({ error: 'Failed to fetch market data.' });
  }
}

async function getWatchlist(req, res) {
  try {
    const db = getDB();
    const watchlist = db.prepare('SELECT * FROM watchlist WHERE user_id = ?').all(req.user.id);

    if (watchlist.length === 0) return res.json([]);

    const symbols = watchlist.filter(w => w.type === 'crypto').map(w => w.symbol).join(',');
    if (!symbols) return res.json([]);

    const cacheKey = `watchlist_${symbols}`;
    let data = getCached(cacheKey, 60);

    if (!data) {
      const response = await axios.get(`${COINGECKO_BASE}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          ids: symbols,
          order: 'market_cap_desc',
          per_page: 20,
          page: 1,
          sparkline: true,
          price_change_percentage: '24h'
        }
      });
      data = response.data;
      setCache(cacheKey, data);
    }

    res.json(data);
  } catch (err) {
    console.error('Watchlist error:', err.message);
    res.status(500).json({ error: 'Failed to fetch watchlist data.' });
  }
}

async function addToWatchlist(req, res) {
  try {
    const { symbol, type } = req.body;
    if (!symbol || !type) return res.status(400).json({ error: 'Symbol and type required.' });

    const db = getDB();
    db.prepare('INSERT OR IGNORE INTO watchlist (user_id, symbol, type) VALUES (?, ?, ?)').run(req.user.id, symbol.toLowerCase(), type);
    res.status(201).json({ message: 'Added to watchlist.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to watchlist.' });
  }
}

async function removeFromWatchlist(req, res) {
  const db = getDB();
  db.prepare('DELETE FROM watchlist WHERE user_id = ? AND symbol = ?').run(req.user.id, req.params.symbol);
  res.json({ message: 'Removed from watchlist.' });
}

module.exports = { getMarketData, getWatchlist, addToWatchlist, removeFromWatchlist };
