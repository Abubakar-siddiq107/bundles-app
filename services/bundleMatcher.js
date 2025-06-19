// bundleMatcher.js

const fs = require('fs');
const path = require('path');

const bundles = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/bundles.json'), 'utf8')
);

function expandItems(items) {
  const expanded = [];
  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) {
      expanded.push({ ...item, quantity: 1 });
    }
  }
  return expanded;
}

function groupItems(items, type) {
  return items.filter(item => item.product_type.toLowerCase() === type.toLowerCase());
}

function removeMatchedItems(items, matched) {
  const result = [...items];
  for (const m of matched) {
    const index = result.findIndex(i => i.variant_id === m.variant_id);
    if (index !== -1) result.splice(index, 1);
  }
  return result;
}

function matchBundleType(items, bundle) {
  const matchedGroups = [];
  const pool = groupItems(items, bundle.product_type);
  while (pool.length >= bundle.min_quantity) {
    matchedGroups.push(pool.splice(0, bundle.min_quantity));
  }
  return matchedGroups;
}

function matchAnyBundle(items, bundle) {
  const matchedGroups = [];
  const pool = [...items];
  while (pool.length >= bundle.min_quantity) {
    matchedGroups.push(pool.splice(0, bundle.min_quantity));
  }
  return matchedGroups;
}

function matchBundles(cartItems) {
  let expanded = expandItems(cartItems);
  const line_items = [];

  for (const bundle of bundles.filter(b => b.product_type !== 'any')) {
    const matches = matchBundleType(expanded, bundle);
    for (const group of matches) {
      line_items.push({
        title: `${bundle.bundle_name} - ${group.map(i => i.title).join(', ')}`,
        quantity: 1,
        price: bundle.bundle_price,
        variant_ids: group.map(i => i.variant_id)
      });
    }
    expanded = removeMatchedItems(expanded, matches.flat());
  }

  const anyBundle = bundles.find(b => b.product_type === 'any');
  if (anyBundle) {
    const matches = matchAnyBundle(expanded, anyBundle);
    for (const group of matches) {
      line_items.push({
        title: `${anyBundle.bundle_name} - ${group.map(i => i.title).join(', ')}`,
        quantity: 1,
        price: anyBundle.bundle_price,
        variant_ids: group.map(i => i.variant_id)
      });
    }
    expanded = removeMatchedItems(expanded, matches.flat());
  }

  for (const item of expanded) {
    line_items.push({
      title: item.title,
      quantity: 1,
      price: item.price,
      variant_ids: [item.variant_id]
    });
  }

  return line_items;
}

module.exports = matchBundles;
