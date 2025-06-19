const fs = require('fs');
const path = require('path');

// Load bundle definitions
const bundlesPath = path.join(__dirname, '../bundles/bundles.json');
const bundleDefinitions = JSON.parse(fs.readFileSync(bundlesPath, 'utf-8'));

function matchBundles(cartItems) {
  const outputItems = [];

  const itemsByType = {};

  // Step 1: Group cart items by product_type
  for (const item of cartItems) {
    const type = item.product_type.toLowerCase();

    if (!itemsByType[type]) itemsByType[type] = [];
    for (let i = 0; i < item.quantity; i++) {
      itemsByType[type].push({
        title: item.title,
        price: item.price,
        variant_id: item.variant_id
      });
    }
  }

  // Step 2: Apply product-type-specific bundles
  for (const bundle of bundleDefinitions.filter(b => b.product_type !== 'any')) {
    const type = bundle.product_type.toLowerCase();
    const eligibleItems = itemsByType[type] || [];

    const bundleCount = Math.floor(eligibleItems.length / bundle.min_quantity);

    for (let i = 0; i < bundleCount; i++) {
      const itemsInBundle = eligibleItems.splice(0, bundle.min_quantity);
      const perItemPrice = +(bundle.bundle_price / bundle.min_quantity).toFixed(2);

      for (const item of itemsInBundle) {
        outputItems.push({
          title: item.title,
          variant_id: item.variant_id,
          quantity: 1,
          price: perItemPrice
        });
      }
    }

    // Remaining (non-bundled) items at full price
    for (const item of eligibleItems) {
      outputItems.push({
        title: item.title,
        variant_id: item.variant_id,
        quantity: 1,
        price: item.price
      });
    }

    // Mark processed
    delete itemsByType[type];
  }

  // Step 3: Apply 'any' bundle across remaining items
  const remainingItems = Object.values(itemsByType).flat();

  const anyBundle = bundleDefinitions.find(b => b.product_type === 'any');
  if (anyBundle) {
    const bundleCount = Math.floor(remainingItems.length / anyBundle.min_quantity);

    for (let i = 0; i < bundleCount; i++) {
      const itemsInBundle = remainingItems.splice(0, anyBundle.min_quantity);
      const perItemPrice = +(anyBundle.bundle_price / anyBundle.min_quantity).toFixed(2);

      for (const item of itemsInBundle) {
        outputItems.push({
          title: item.title,
          variant_id: item.variant_id,
          quantity: 1,
          price: perItemPrice
        });
      }
    }

    // Add leftovers
    for (const item of remainingItems) {
      outputItems.push({
        title: item.title,
        variant_id: item.variant_id,
        quantity: 1,
        price: item.price
      });
    }
  }

  return outputItems;
}

module.exports = matchBundles;
