const express = require('express');
const router = express.Router();

// Cache for BTC data (refresh every 60 seconds)
let cache = {
  ohlc: {},
  price: null,
  lastFetch: 0,
};

const CACHE_DURATION = 60000; // 60 seconds

// Fetch with timeout
async function fetchWithTimeout(url, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

// GET /api/btc/ohlc?days=7
router.get('/ohlc', async (req, res) => {
  try {
    const days = req.query.days || '7';
    const cacheKey = `ohlc_${days}`;
    const now = Date.now();

    // Return cached data if fresh
    if (cache.ohlc[days] && (now - cache.lastFetch) < CACHE_DURATION) {
      return res.json({ success: true, data: cache.ohlc[days] });
    }

    // Try CoinGecko first
    let data = null;
    try {
      const ohlcRes = await fetchWithTimeout(
        `https://api.coingecko.com/api/v3/coins/bitcoin/ohlc?vs_currency=usd&days=${days}`
      );
      if (ohlcRes.ok) {
        const raw = await ohlcRes.json();
        data = raw.map(([timestamp, open, high, low, close]) => ({
          time: days === '1'
            ? new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          fullDate: new Date(timestamp).toLocaleString(),
          open: parseFloat(open),
          high: parseFloat(high),
          low: parseFloat(low),
          close: parseFloat(close),
        }));
      }
    } catch (e) {
      console.log('CoinGecko OHLC failed, trying Binance...');
    }

    // Fallback to Binance
    if (!data) {
      const intervalMap = { '1': '1h', '7': '4h', '30': '1d', '90': '1d', '365': '1w' };
      const limitMap = { '1': 24, '7': 42, '30': 30, '90': 90, '365': 52 };
      try {
        const binanceRes = await fetchWithTimeout(
          `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${intervalMap[days]}&limit=${limitMap[days]}`
        );
        if (binanceRes.ok) {
          const raw = await binanceRes.json();
          data = raw.map(([timestamp, open, high, low, close]) => ({
            time: days === '1'
              ? new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              : new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            fullDate: new Date(timestamp).toLocaleString(),
            open: parseFloat(open),
            high: parseFloat(high),
            low: parseFloat(low),
            close: parseFloat(close),
          }));
        }
      } catch (e) {
        console.log('Binance OHLC failed');
      }
    }

    if (!data) {
      return res.status(503).json({ success: false, message: 'BTC data unavailable' });
    }

    cache.ohlc[days] = data;
    cache.lastFetch = now;
    res.json({ success: true, data });
  } catch (error) {
    console.error('BTC OHLC error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch BTC data' });
  }
});

// GET /api/btc/price
router.get('/price', async (req, res) => {
  try {
    const now = Date.now();

    if (cache.price && (now - cache.lastFetch) < CACHE_DURATION) {
      return res.json({ success: true, data: cache.price });
    }

    const priceRes = await fetchWithTimeout(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_high=true&include_24hr_low=true&include_24hr_vol=true'
    );

    if (!priceRes.ok) throw new Error('Price fetch failed');

    const raw = await priceRes.json();
    const btc = raw.bitcoin;

    cache.price = {
      price: btc.usd,
      change24h: btc.usd_24h_change,
      high24h: btc.usd_24h_high,
      low24h: btc.usd_24h_low,
      volume24h: btc.usd_24h_vol,
      marketCap: btc.usd * 19600000, // ~19.6M BTC circulating
    };
    cache.lastFetch = now;

    res.json({ success: true, data: cache.price });
  } catch (error) {
    console.error('BTC price error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch BTC price' });
  }
});

module.exports = router;