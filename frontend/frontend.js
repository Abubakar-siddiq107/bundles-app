// frontend.js

async function getCartData() {
  const res = await fetch('/cart.js');
  const cart = await res.json();

  return cart.items.map(item => ({
    title: item.product_title,
    product_type: item.product_type,
    quantity: item.quantity,
    price: item.final_price / 100  // Convert from cents to ₹
  }));
}

async function createBundleDraftOrder(cartItems) {
  const response = await fetch('https://your-app-name.onrender.com/apply-bundle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ cartItems })
  });

  const data = await response.json();
  if (data.checkoutUrl) {
    window.location.href = data.checkoutUrl; // Redirect to Shopify Draft Order Checkout
  } else {
    alert('Something went wrong applying bundle discount.');
  }
}

function replaceCheckoutButton() {
  const originalButton = document.querySelector('form[action="/cart"] [type="submit"], button[name="checkout"]');
  if (!originalButton) return;

  // Hide original button
  originalButton.style.display = 'none';

  // Create custom checkout button
  const customButton = document.createElement('button');
  customButton.innerText = 'Checkout with Bundle Offer';
  customButton.style.cssText = `
    background-color: black;
    color: white;
    padding: 14px 24px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-size: 16px;
    margin-top: 12px;
    width: 100%;
  `;

  originalButton.parentNode.insertBefore(customButton, originalButton.nextSibling);

  customButton.addEventListener('click', async () => {
    const cartItems = await getCartData();
    await createBundleDraftOrder(cartItems);
  });
}

// Run this after DOM is loaded
document.addEventListener('DOMContentLoaded', replaceCheckoutButton);
