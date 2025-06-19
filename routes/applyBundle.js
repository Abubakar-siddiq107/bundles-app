const matchBundles = require('../services/bundleMatcher');

async function applyBundleLogic(cartItems) {
  const { line_items, bundleName, bundleTotal } = matchBundles(cartItems);

  const draftOrder = {
    line_items: line_items.map(item => ({
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
    bundleName,
    bundleTotal
  };
}

module.exports = applyBundleLogic;
