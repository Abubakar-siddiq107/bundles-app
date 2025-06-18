// shopify.js

const axios = require('axios');
require('dotenv').config();

const SHOPIFY_API_VERSION = '2024-01'; // Change if you're using another version

const shopify = axios.create({
  baseURL: `https://${process.env.SHOPIFY_SHOP}/admin/api/${SHOPIFY_API_VERSION}`,
  headers: {
    'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN,
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
    console.error('❌ Error creating draft order:', error.response?.data || error.message);
    throw new Error('Failed to create draft order');
  }
}

module.exports = {
  createDraftOrder
};
