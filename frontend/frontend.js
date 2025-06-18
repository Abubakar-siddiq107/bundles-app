async function getCartData() {
  const res = await fetch('/cart.js');
  const cart = await res.json();

  return cart.items.map(item => ({
    title: item.product_title,
    product_type: item.product_type,
    quantity: item.quantity,
    price: item.final_price / 100, // Convert cents to ₹
    variant_id: item.variant_id // 🟢 Important for future use
  }));
}

async function createBundleDraftOrder(cartItems) {
  const response = await fetch('https://bundles-app.onrender.com/apply-bundle', { // 🟡 Replace with actual Render URL
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ cartItems })
  });

  const data = await response.json();
  if (data.checkoutUrl) {
    window.location.href = data.checkoutUrl;
  } else {
    alert('❌ Failed to create bundle offer. Try again.');
  }
}

function replaceCheckoutButton() {
  const originalButton = document.querySelector('form[action="/cart"] [type="submit"], button[name="checkout"]');
  if (!originalButton) return;

  originalButton.style.display = 'none';

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

document.addEventListener('DOMContentLoaded', replaceCheckoutButton);
