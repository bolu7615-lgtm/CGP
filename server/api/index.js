try {
  const app = require('../src/app');
  module.exports = app;
} catch (err) {
  console.error('STARTUP ERROR:', err);
  const express = require('express');
  const fail = express();
  fail.use((req, res) => res.status(500).json({ error: err.message, stack: err.stack }));
  module.exports = fail;
}