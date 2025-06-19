// bundleMatcher.js

const fs = require('fs');
const path = require('path');

const bundles = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../bundles/bundles.json'), 'utf8')
);

function cloneItem(item, qty, overridePrice = null) {
  return {
    title: `${item.title} (${item.variant_title})`,
    quantity: qty,
    price: overridePrice !== null ? overridePrice : item.price,
    variant_id: item.variant_id
  };
}

function matchBundles(cartItems) {
  let remainingItems = [...cartItems];
  const line_items = [];

  // Step 1: Match product-type-specific bundles
  for (const bundle of bundles.filter(b => b.product_type !== 'any')) {
    const matchingItems = remainingItems.filter(
      item => item.product_type.toLowerCase() === bundle.product_type.toLowerCase()
    );

    const totalQty = matchingItems.reduce((sum, i) => sum + i.quantity, 0);
    const bundleCount = Math.floor(totalQty / bundle.min_quantity);
    const itemsNeeded = bundleCount * bundle.min_quantity;

    if (bundleCount > 0) {
      let qtyToBundle = itemsNeeded;
      const matched = [];

      for (const item of matchingItems) {
        if (qtyToBundle === 0) break;
        const qtyUsed = Math.min(item.quantity, qtyToBundle);
        matched.push({ ...item, quantity: qtyUsed });
        qtyToBundle -= qtyUsed;
      }

      const splitPrice = parseFloat((bundle.bundle_price / itemsNeeded).toFixed(2));
      matched.forEach(m => {
        line_items.push(cloneItem(m, m.quantity, splitPrice));
      });

      // Remove used quantities from remainingItems
      for (const used of matched) {
        const index = remainingItems.findIndex(i =>
          i.title === used.title &&
          i.variant_id === used.variant_id
        );
        if (index !== -1) {
          if (remainingItems[index].quantity === used.quantity) {
            remainingItems.splice(index, 1);
          } else {
            remainingItems[index].quantity -= used.quantity;
          }
        }
      }
    }
  }

  // Step 2: Apply "Any 3 Items" bundle
  const anyBundle = bundles.find(b => b.product_type === 'any');
  const totalQty = remainingItems.reduce((sum, i) => sum + i.quantity, 0);
  const bundleCount = Math.floor(totalQty / anyBundle.min_quantity);
  const itemsNeeded = bundleCount * anyBundle.min_quantity;

  if (bundleCount > 0) {
    let qtyToBundle = itemsNeeded;
    const matched = [];

    for (const item of remainingItems) {
      if (qtyToBundle === 0) break;
      const qtyUsed = Math.min(item.quantity, qtyToBundle);
      matched.push({ ...item, quantity: qtyUsed });
      qtyToBundle -= qtyUsed;
    }

    const splitPrice = parseFloat((anyBundle.bundle_price / itemsNeeded).toFixed(2));
    matched.forEach(m => {
      line_items.push(cloneItem(m, m.quantity, splitPrice));
    });

    // Remove used quantities
    for (const used of matched) {
      const index = remainingItems.findIndex(i =>
        i.title === used.title &&
        i.variant_id === used.variant_id
      );
      if (index !== -1) {
        if (remainingItems[index].quantity === used.quantity) {
          remainingItems.splice(index, 1);
        } else {
          remainingItems[index].quantity -= used.quantity;
        }
      }
    }
  }

  // Step 3: Add leftover items at full price
  for (const item of remainingItems) {
    line_items.push(cloneItem(item, item.quantity));
  }

  return line_items;
}

module.exports = matchBundles;
