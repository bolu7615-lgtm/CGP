const express = require('express');
const router = express.Router();

// Cache
let cache = {
  price: null,
  ohlc: {},
  lastPriceFetch: 0,
  lastOhlcFetch: 0,
};
const PRICE_CACHE = 30000;
const OHLC_CACHE = 60000;

// Mock data for when APIs are blocked
const MOCK_PRICE = {
  price: 67432.15,
  change24h: 2.34,
  high24h: 68100.00,
  low24h: 65900.00,
  volume24h: 28500000000,
  marketCap: 1325000000000,
};

function generateMockOHLC(days) {
  const data = [];
  const now = Date.now();
  let basePrice = 67000;
  
  const count = days === '1' ? 24 : parseInt(days);
  const interval = days === '1' ? 3600000 : 86400000;
  
  for (let i = count; i >= 0; i--) {
    const time = now - (i * interval);
    const volatility = (Math.random() - 0.5) * 2000;
    const open = basePrice;
    const close = basePrice + volatility;
    const high = Math.max(open, close) + Math.random() * 500;
    const low = Math.min(open, close) - Math.random() * 500;
    
    data.push({
      time: days === '1'
        ? new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : new Date(time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: new Date(time).toLocaleString(),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    });
    
    basePrice = close;
  }
  return data;
}

// ============================================
// GET /api/btc/price
// ============================================
router.get('/price', async (req, res) => {
  const now = Date.now();

  if (cache.price && (now - cache.lastPriceFetch) < PRICE_CACHE) {
    return res.json({ success: true, data: cache.price, cached: true });
  }

  let btcData = null;
  let source = null;

  // Try real APIs
  try {
    const response = await fetch('https://api.coincap.io/v2/assets/bitcoin', { timeout: 5000 });
    if (response.ok) {
      const data = await response.json();
      const d = data.data;
      btcData = {
        price: parseFloat(d.priceUsd),
        change24h: parseFloat(d.changePercent24Hr),
        high24h: null,
        low24h: null,
        volume24h: parseFloat(d.volumeUsd24Hr),
        marketCap: parseFloat(d.marketCapUsd),
      };
      source = 'coincap';
    }
  } catch (e) {
    console.log('CoinCap failed, using mock data');
  }

  // Fallback to mock
  if (!btcData) {
    btcData = MOCK_PRICE;
    source = 'mock';
  }

  cache.price = btcData;
  cache.lastPriceFetch = now;
  res.json({ success: true, data: btcData, source });
});

// ============================================
// GET /api/btc/ohlc
// ============================================
router.get('/ohlc', async (req, res) => {
  const days = req.query.days || '7';
  const now = Date.now();

  if (cache.ohlc[days] && (now - cache.lastOhlcFetch) < OHLC_CACHE) {
    return res.json({ success: true, data: cache.ohlc[days], cached: true });
  }

  let data = null;
  let source = null;

  // Try real API
  try {
    const limit = days === '1' ? 24 : parseInt(days);
    const endpoint = days === '1' ? 'histohour' : 'histoday';
    const response = await fetch(
      `https://min-api.cryptocompare.com/data/v2/${endpoint}?fsym=BTC&tsym=USD&limit=${limit}`,
      { timeout: 5000 }
    );
    if (response.ok) {
      const resData = await response.json();
      data = resData.Data.Data.map(c => ({
        time: days === '1'
          ? new Date(c.time * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : new Date(c.time * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: new Date(c.time * 1000).toLocaleString(),
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
      source = 'cryptocompare';
    }
  } catch (e) {
    console.log('CryptoCompare OHLC failed, using mock data');
  }

  // Fallback to mock
  if (!data) {
    data = generateMockOHLC(days);
    source = 'mock';
  }

  cache.ohlc[days] = data;
  cache.lastOhlcFetch = now;
  res.json({ success: true, data, source });
});

module.exports = router;