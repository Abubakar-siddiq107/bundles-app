const matchBundles = require('../services/bundleMatcher');

async function applyBundleLogic(cartItems) {
  const matchResult = matchBundles(cartItems);

  const draftOrder = {
    line_items: matchResult.line_items.map(item => ({
      title: `${item.title} (Size: ${item.variant_title})`,
      quantity: item.quantity,
      price: item.price.toFixed(2)
    })),
    currency: 'INR',
    use_customer_default_address: true,
    note: 'Created via Kezual Bundles App',
    tags: 'Kezual-Bundle'
  };

  return {
    draftOrder,
    bundleName: matchResult.bundleName,    // e.g. "2 Jackets for ₹2999"
    bundleTotal: matchResult.bundleTotal   // e.g. 2999
  };
}

module.exports = applyBundleLogic;
