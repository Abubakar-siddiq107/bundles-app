// routes/applyBundle.js

const express = require('express');
const router = express.Router();

const matchBundles = require('../services/bundleMatcher');
const { createDraftOrder } = require('../utils/shopify');

// POST /apply-bundle
router.post('/', async (req, res) => {
  try {
    const cartItems = req.body.cart;
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: 'Invalid cart data' });
    }

    // Match bundle(s) and calculate pricing
    const matchedResult = matchBundles(cartItems);

    if (!matchedResult || matchedResult.lineItems.length === 0) {
      return res.status(200).json({ message: 'No matching bundle', redirectUrl: null });
    }

    // Create draft order in Shopify
    const draftOrderUrl = await createDraftOrder(matchedResult.lineItems);

    return res.status(200).json({ redirectUrl: draftOrderUrl });
  } catch (err) {
    console.error('Error in /apply-bundle:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

