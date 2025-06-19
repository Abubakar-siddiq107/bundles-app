
const matchBundles = require('../services/bundleMatcher');

async function applyBundleLogic(cartItems) {
  const line_items = matchBundles(cartItems);

  const draftOrder = {
    line_items: line_items.map(item => ({
      title: item.title,
      quantity: item.quantity,
      price: item.price.toFixed(2),
      variant_id: item.variant_id
    })),
    currency: 'INR',
    use_customer_default_address: true,
    note: 'Created via Kezual Bundles App',
    tags: 'Kezual-Bundle'
  };

  return draftOrder;
}

module.exports = applyBundleLogic;
