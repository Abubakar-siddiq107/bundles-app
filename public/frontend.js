async function sendCartToBundleApp() {
  const cart = await fetch('/cart.js').then(res => res.json());
  const jackets = cart.items.filter(item => item.product_type?.toLowerCase() === "jacket");

  const cleanItems = [];
  jackets.forEach(j => {
    for (let i = 0; i < j.quantity; i++) {
      cleanItems.push({
        variant_id: j.variant_id,
        title: j.title,
        quantity: 1
      });
    }
  });

  if (cleanItems.length >= 2) {
    const response = await fetch("https://bundles-app.onrender.com/create-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cleanItems })
    });

    const data = await response.json();
    if (data?.url) window.location.href = data.url;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  if (window.location.pathname === "/cart") {
    const cart = await fetch('/cart.js').then(res => res.json());
    const jackets = cart.items.filter(item => item.product_type?.toLowerCase() === "jacket");
    const defaultCheckout = document.querySelector("form[action='/cart'] [type='submit']");

    if (defaultCheckout) {
      defaultCheckout.style.display = "none";

      const bundleBtn = document.createElement("button");
      bundleBtn.innerText = "Checkout";
      bundleBtn.className = "btn btn--full";
      bundleBtn.style.marginTop = "10px";
      bundleBtn.onclick = (e) => {
        e.preventDefault();
        sendCartToBundleApp();
      };
      defaultCheckout.parentNode.appendChild(bundleBtn);
    }

    // Price visual update
    const jacketUnitPrice = 1499.5;
    let totalJackets = jackets.reduce((sum, j) => sum + j.quantity, 0);
    const bundleCount = Math.floor(totalJackets / 2);
    const leftoverCount = totalJackets % 2;

    const cartItems = document.querySelectorAll(".cart__row");
    let updatedSubtotal = 0;
    let bundleApplied = 0;

    jackets.forEach((jacket) => {
      for (let i = 0; i < jacket.quantity; i++) {
        const itemRow = Array.from(cartItems).find(row => {
          const title = row.querySelector(".cart__product-title a");
          return title && title.innerText.trim() === jacket.product_title.trim();
        });

        if (itemRow) {
          const priceEl = itemRow.querySelector(".cart__price");
          if (priceEl) {
            const originalPriceText = priceEl.innerText.trim();
            const originalPrice = parseFloat(originalPriceText.replace(/[₹,]/g, ''));

            if (bundleApplied < bundleCount * 2) {
              priceEl.innerHTML = `<span style='text-decoration:line-through;color:gray;font-size:0.9em;'>₹${originalPrice.toLocaleString("en-IN")}.00</span><br><strong>₹${jacketUnitPrice.toLocaleString("en-IN")}</strong>`;
              updatedSubtotal += jacketUnitPrice;
              bundleApplied++;
            } else {
              priceEl.innerHTML = `<strong>₹${originalPrice.toLocaleString("en-IN")}.00</strong>`;
              updatedSubtotal += originalPrice;
            }
          }
        }
      }
    });

    const subtotalEl = document.querySelector(".cart__subtotal .h3");
    if (subtotalEl) {
      const oldText = subtotalEl.innerText.trim();
      subtotalEl.innerHTML = `<span style='text-decoration:line-through;color:gray;font-size:0.9em;'>${oldText}</span><br><strong>₹${updatedSubtotal.toLocaleString("en-IN")}.00</strong>`;
    }

    const cartForm = document.querySelector("form[action='/cart']");
    const offerNote = document.createElement("p");
    const noteText = `Offer Applied: ${bundleCount * 2} Jackets at ₹${(bundleCount * 2999).toLocaleString("en-IN")} ` +
      (leftoverCount > 0 ? `+ ${leftoverCount} Jacket(s) at regular price` : ``);
    offerNote.innerHTML = `<em style='color:green;font-weight:600;'>${noteText}</em>`;
    offerNote.style.marginTop = "10px";
    cartForm.appendChild(offerNote);
  }
});
