// applyBundle.js

const matchBundles = require('./bundleMatcher');

async function applyBundleLogic(cartItems) {
  // Step 1: Run the bundle matcher logic
  const line_items = matchBundles(cartItems);

  // Step 2: Assemble final draft order object
  const draftOrder = {
    line_items: line_items.map(item => ({
      title: item.title,
      quantity: item.quantity,
      price: item.price.toString()
    })),
    currency: 'INR',
    use_customer_default_address: true,
    tags: ['Created by Kezual Bundle App']
  };

  return draftOrder;
}

module.exports = applyBundleLogic;
