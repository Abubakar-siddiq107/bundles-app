const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const applyBundleLogic = require('./routes/applyBundle');
const { createDraftOrder } = require('./utils/shopify');

dotenv.config();

// ✅ CORS Configuration
const allowedOrigin = process.env.CLIENT_ORIGIN || 'https://knkas.myshopify.com';

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST'],
  credentials: false // Shopify doesn’t need cookies for draft order
}));

app.use(bodyParser.json());

// ✅ Main Route
app.post('/apply-bundle', async (req, res) => {
  try {
    const { cartItems } = req.body;
    if (!Array.isArray(cartItems)) {
      return res.status(400).json({ error: 'Invalid cart items format' });
    }

    const draftOrder = await applyBundleLogic(cartItems);
    const response = await createDraftOrder(draftOrder);

    const checkoutUrl = response?.data?.draft_order?.invoice_url;
    if (!checkoutUrl) throw new Error('Draft order creation failed');

    return res.status(200).json({ checkoutUrl });

  } catch (err) {
    console.error('❌ Error in /apply-bundle:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ✅ Health Check
app.get('/', (req, res) => {
  res.send('✅ Bundle App is Running');
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔧 Shopify Shop: ${process.env.SHOPIFY_SHOP}`);
  console.log(`🔑 Shopify Token: ${process.env.SHOPIFY_ADMIN_TOKEN ? 'Loaded ✅' : 'Missing ❌'}`);
});
