// ✅ shopify.js
const axios = require('axios');
require('dotenv').config();

const SHOPIFY_API_VERSION = '2024-01';

const shop = process.env.SHOPIFY_SHOP;
const token = process.env.SHOPIFY_ADMIN_TOKEN;

if (!shop || !token) {
  console.error('❌ Missing SHOPIFY_SHOP or SHOPIFY_ADMIN_TOKEN in environment variables');
}

const shopify = axios.create({
  baseURL: `https://${shop}/admin/api/${SHOPIFY_API_VERSION}`,
  headers: {
    'X-Shopify-Access-Token': token,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

async function createDraftOrder(draftOrder) {
  try {
    const response = await shopify.post('/draft_orders.json', {
      draft_order: draftOrder
    });
    return response;
  } catch (error) {
    const details = error.response?.data || error.message;
    console.error('❌ Error creating draft order:', JSON.stringify(details, null, 2));
    throw new Error(`Shopify API error: ${details.errors || 'Unknown error'}`);
  }
}

module.exports = {
  createDraftOrder
};
