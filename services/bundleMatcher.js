// bundleMatcher.js

const fs = require('fs');
const path = require('path');

const bundles = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'bundles.json'), 'utf8')
);

function groupByProductType(cartItems) {
  const groups = {};
  for (const item of cartItems) {
    const type = item.product_type.toLowerCase();
    if (!groups[type]) groups[type] = [];
    groups[type].push(item);
  }
  return groups;
}

function matchBundles(cartItems) {
  const line_items = [];
  let remainingItems = [...cartItems];

  // First apply specific bundles (jacket, pant, hoodie)
  for (const bundle of bundles.filter(b => b.product_type !== 'any')) {
    const matchingItems = remainingItems.filter(
      item => item.product_type.toLowerCase() === bundle.product_type.toLowerCase()
    );

    const totalQty = matchingItems.reduce((sum, item) => sum + item.quantity, 0);
    const bundleCount = Math.floor(totalQty / bundle.min_quantity);
    const leftoverQty = totalQty % bundle.min_quantity;

    if (bundleCount > 0) {
      line_items.push({
        title: `${bundle.bundle_name} Bundle`,
        quantity: bundleCount,
        price: bundle.bundle_price
      });
    }

    // Retain only leftovers for the next round
    const qtyToRemove = bundleCount * bundle.min_quantity;
    let qtyLeft = qtyToRemove;
    const newRemaining = [];

    for (const item of matchingItems) {
      if (qtyLeft >= item.quantity) {
        qtyLeft -= item.quantity;
        // fully consumed, skip
      } else {
        newRemaining.push({
          ...item,
          quantity: item.quantity - qtyLeft
        });
        qtyLeft = 0;
      }
    }

    // Add back items that didn’t match this bundle type
    remainingItems = remainingItems
      .filter(i => i.product_type.toLowerCase() !== bundle.product_type.toLowerCase())
      .concat(newRemaining);
  }

  // Now apply "Any 3 Items @ 3999" bundle
  const totalAnyQty = remainingItems.reduce((sum, i) => sum + i.quantity, 0);
  const any3Bundle = bundles.find(b => b.product_type === 'any');
  const anyBundleCount = Math.floor(totalAnyQty / any3Bundle.min_quantity);
  if (anyBundleCount > 0) {
    line_items.push({
      title: `${any3Bundle.bundle_name}`,
      quantity: anyBundleCount,
      price: any3Bundle.bundle_price
    });
  }

  // Reduce remaining items accordingly
  let remainingQtyToRemove = anyBundleCount * any3Bundle.min_quantity;
  const finalLeftovers = [];

  for (const item of remainingItems) {
    if (remainingQtyToRemove >= item.quantity) {
      remainingQtyToRemove -= item.quantity;
      // fully consumed
    } else {
      finalLeftovers.push({
        ...item,
        quantity: item.quantity - remainingQtyToRemove
      });
      remainingQtyToRemove = 0;
    }
  }

  // Add leftover items at full price
  for (const item of finalLeftovers) {
    line_items.push({
      title: item.title,
      quantity: item.quantity,
      price: item.price
    });
  }

  return line_items;
}

module.exports = matchBundles;
