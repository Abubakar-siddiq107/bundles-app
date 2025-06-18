// services/bundleMatcher.js

const fs = require('fs');
const path = require('path');

// Load bundle config once at startup
const bundles = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../bundles/bundles.json'), 'utf-8')
);

// Match bundles and return draft order line items
function matchBundles(cart) {
  const remainingCart = [...cart]; // so we can remove matched items
  const draftLineItems = [];

  for (const bundle of bundles) {
    // Collect matching items
    const matchingItems = remainingCart.filter(item =>
      bundle.product_ids.includes(item.product_id)
    );

    const totalMatchingQty = matchingItems.reduce((sum, item) => sum + item.quantity, 0);
    const bundleCount = Math.floor(totalMatchingQty / bundle.required_quantity);

    if (bundleCount === 0) continue;

    if (bundle.type === 'fixed_price') {
      // Add bundled line item
      draftLineItems.push({
        title: bundle.title,
        price: (bundle.bundle_price * bundleCount).toFixed(2),
        quantity: 1
      });

      // Reduce matched quantities
      deductFromCart(remainingCart, bundle.product_ids, bundle.required_quantity * bundleCount);
    }

    if (bundle.type === 'percentage_off') {
      const discountedQty = bundle.required_quantity * bundleCount;
      const percentOff = bundle.discount_percent;

      // Find products to discount
      const toDiscount = getDiscountedItems(remainingCart, bundle.product_ids, discountedQty);

      toDiscount.forEach(item => {
        draftLineItems.push({
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: (item.price * (1 - percentOff / 100)).toFixed(2)
        });
      });

      // Remove discounted items from cart
      deductFromCart(remainingCart, bundle.product_ids, discountedQty);
    }

    if (bundle.type === 'bogo') {
      const groupCount = bundleCount;
      const chargeQty = bundle.charge_quantity * groupCount;
      const totalQty = bundle.required_quantity * groupCount;

      const toCharge = getDiscountedItems(remainingCart, bundle.product_ids, chargeQty);

      toCharge.forEach(item => {
        draftLineItems.push({
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price.toFixed(2)
        });
      });

      // Skip the free ones (we deduct all)
      deductFromCart(remainingCart, bundle.product_ids, totalQty);
    }
  }

  // Add remaining full-price items
  remainingCart.forEach(item => {
    draftLineItems.push({
      variant_id: item.variant_id,
      quantity: item.quantity,
      price: item.price.toFixed(2)
    });
  });

  return { lineItems: draftLineItems };
}

// Utility to remove matched quantity from cart
function deductFromCart(cart, productIds, qtyToRemove) {
  for (let i = 0; i < cart.length && qtyToRemove > 0; i++) {
    if (productIds.includes(cart[i].product_id)) {
      const deductQty = Math.min(cart[i].quantity, qtyToRemove);
      cart[i].quantity -= deductQty;
      qtyToRemove -= deductQty;

      if (cart[i].quantity === 0) {
        cart.splice(i, 1);
        i--;
      }
    }
  }
}

// Utility to find discounted items with variants and price
function getDiscountedItems(cart, productIds, qtyNeeded) {
  const result = [];

  for (const item of cart) {
    if (productIds.includes(item.product_id) && qtyNeeded > 0) {
      const usedQty = Math.min(qtyNeeded, item.quantity);
      result.push({
        variant_id: item.variant_id,
        price: item.price,
        quantity: usedQty
      });
      qtyNeeded -= usedQty;
    }
  }

  return result;
}

module.exports = matchBundles;
