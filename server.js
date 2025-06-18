// server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const applyBundleRoute = require('./routes/applyBundle');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/apply-bundle', applyBundleRoute);

app.get('/', (req, res) => {
  res.send('🔥 Kezual Bundles App is Running');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
