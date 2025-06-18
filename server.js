// server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const applyBundleLogic = require('./routes/applyBundle');
const { createDraftOrder } = require('./utils/shopify');

// Load environment variables
dotenv.config();

const app = express();

// ✅ Set allowed Shopify frontend origin
const allowedOrigin = process.env.CLIENT_ORIGIN || 'https://knkas.myshopify.com';

app.use(cors({
  origin: allowedOrigin,
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type'],
  credentials: false // Shopify doesn’t send cookies with fetch
}));

app.use(bodyParser.json());

// ✅ Main bundle draft order route
app.post('/apply-bundle', async (req, res) => {
  try {
    const { cartItems } = req.body;

    if (!Array.isArray(cartItems)) {
      return res.status(400).json({ error: 'Invalid cart items format' });
    }

    // Apply custom logic and send to Shopify
    const draftOrder = await applyBundleLogic(cartItems);
    const response = await createDraftOrder(draftOrder);

    const checkoutUrl = response?.data?.draft_order?.invoice_url;
    if (!checkoutUrl) throw new Error('Draft order creation failed');

    return res.status(200).json({ checkoutUrl });
  } catch (err) {
    console.error('❌ Error in /apply-bundle:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Something went wrong while processing the bundle.' });
  }
});

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('✅ Bundle App is Live and Running');
});

// ✅ Start Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔧 Shopify Shop: ${process.env.SHOPIFY_SHOP}`);
  console.log(`🔑 Shopify Token: ${process.env.SHOPIFY_ADMIN_TOKEN ? 'Loaded ✅' : 'Missing ❌'}`);
});
