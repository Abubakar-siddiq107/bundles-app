const bundles = require('../bundles.json');

function matchBundles(cartItems) {
  const matchedItems = [];
  let remainingItems = [...cartItems];

  const getItemsByType = (type) =>
    remainingItems.filter(item => type === 'any' || item.product_type.toLowerCase() === type);

  for (const bundle of bundles) {
    const matched = [];
    const eligibleItems = getItemsByType(bundle.product_type);

    if (eligibleItems.length >= bundle.min_quantity) {
      // Pick items to match the bundle
      let quantityLeft = bundle.min_quantity;

      for (const item of eligibleItems) {
        if (quantityLeft <= 0) break;

        const takeQty = Math.min(item.quantity, quantityLeft);
        matched.push({ ...item, quantity: takeQty });
        quantityLeft -= takeQty;
      }

      if (matched.reduce((sum, item) => sum + item.quantity, 0) === bundle.min_quantity) {
        matchedItems.push({
          bundleName: bundle.bundle_name,
          bundlePrice: bundle.bundle_price,
          items: matched
        });

        // Remove matched items from remainingItems
        matched.forEach(matchedItem => {
          const index = remainingItems.findIndex(
            i => i.variant_id === matchedItem.variant_id
          );
          if (index !== -1) {
            remainingItems[index].quantity -= matchedItem.quantity;
            if (remainingItems[index].quantity <= 0) {
              remainingItems.splice(index, 1);
            }
          }
        });
      }
    }
  }

  return { matchedItems, remainingItems };
}

module.exports = async function applyBundleLogic(cartItems) {
  const { matchedItems, remainingItems } = matchBundles(cartItems);
  const line_items = [];

  // Add bundles
  matchedItems.forEach(bundle => {
    line_items.push({
      title: bundle.bundleName,
      price: bundle.bundlePrice,
      quantity: 1
    });
  });

  // Add remaining items
  remainingItems.forEach(item => {
    line_items.push({
      variant_id: item.variant_id,
      quantity: item.quantity
    });
  });

  return { line_items };
};
