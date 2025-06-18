// public/frontend.js

(async function () {
  // Wait for cart to load
  async function fetchCart() {
    const res = await fetch('/cart.js');
    return await res.json();
  }

  // Format cart for backend API
  function formatCartItems(items) {
    return items.map(item => ({
      product_id: item.product_id.toString(),
      variant_id: item.variant_id.toString(),
      price: item.original_line_price / item.quantity / 100,
      quantity: item.quantity
    }));
  }

  // Replace default checkout button
  function overrideCheckoutButton() {
    const defaultButton = document.querySelector('[name="checkout"], .checkout, .cart__checkout');
    if (!defaultButton) return;

    const customButton = defaultButton.cloneNode(true);
    customButton.innerText = 'Checkout with Bundle Offer';
    defaultButton.style.display = 'none';
    defaultButton.parentNode.insertBefore(customButton, defaultButton);

    customButton.addEventListener('click', async () => {
      try {
        const cart = await fetchCart();
        const formattedCart = formatCartItems(cart.items);

        const res = await fetch('https://bundles-app.onrender.com/apply-bundle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart: formattedCart })
        });

        const data = await res.json();

        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          // No bundle matched — fallback to Shopify default checkout
          defaultButton.click();
        }
      } catch (err) {
        console.error('Bundle checkout failed:', err);
        defaultButton.click();
      }
    });
  }

  // Run on DOM ready
  document.addEventListener('DOMContentLoaded', overrideCheckoutButton);
})();

