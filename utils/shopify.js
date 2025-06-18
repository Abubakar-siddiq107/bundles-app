// utils/shopify.js

const axios = require('axios');
require('dotenv').config();

const SHOP = process.env.SHOPIFY_STORE_URL; // e.g. knkas.myshopify.com
const TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;

async function createDraftOrder(lineItems) {
  try {
    const draftOrderPayload = {
      draft_order: {
        line_items: lineItems.map(item => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price
        })),
        tags: ['created-by-bundles-app']
      }
    };

    const response = await axios.post(
      `https://${SHOP}/admin/api/2024-01/draft_orders.json`,
      draftOrderPayload,
      {
        headers: {
          'X-Shopify-Access-Token': TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.draft_order.invoice_url;
  } catch (error) {
    console.error('❌ Error creating draft order:', error.response?.data || error.message);
    throw new Error('Failed to create draft order');
  }
}

module.exports = { createDraftOrder };

