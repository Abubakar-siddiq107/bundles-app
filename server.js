// server.js

const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const applyBundleLogic = require('./routes/applyBundle');
const { createDraftOrder } = require('./utils/shopify'); // Make sure path is correct

// Load environment variables
dotenv.config();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Route: Apply bundle and return draft order checkout URL
app.post('/apply-bundle', async (req, res) => {
  try {
    const { cartItems } = req.body;

    if (!cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({ error: 'Invalid cart items format' });
    }

    // Step 1: Apply bundle logic
    const draftOrder = await applyBundleLogic(cartItems);

    // Step 2: Create draft order on Shopify
    const response = await createDraftOrder(draftOrder);

    // Step 3: Extract checkout URL
    const checkoutUrl = response?.data?.draft_order?.invoice_url;
    if (!checkoutUrl) throw new Error('Draft order creation failed');

    return res.status(200).json({ checkoutUrl });

  } catch (err) {
    console.error('❌ Error in /apply-bundle:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Health check route
app.get('/', (req, res) => {
  res.send('✅ Bundle App is Running');
});

// Use Render-assigned port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔧 Shopify Shop: ${process.env.SHOPIFY_SHOP}`);
  console.log(`🔑 Shopify Token: ${process.env.SHOPIFY_ADMIN_TOKEN ? 'Loaded ✅' : 'Missing ❌'}`);
});
