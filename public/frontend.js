async function sendCartToBundleApp() {
  const cart = await fetch('/cart.js').then(res => res.json());
  const jackets = cart.items.filter(item => item.product_type?.toLowerCase() === "jacket");

  if (jackets.length >= 2) {
    const response = await fetch("https://bundles-app.onrender.com/create-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: jackets.map(j => ({
          variant_id: j.variant_id,
          quantity: j.quantity,
          title: j.title,
          product_type: j.product_type
        }))
      })
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

    const jacketUnitPrice = 1499.5;
    let totalJackets = jackets.reduce((sum, j) => sum + j.quantity, 0);
    const bundleCount = Math.floor(totalJackets / 2);
    const leftoverCount = totalJackets % 2;

    const cartItems = document.querySelectorAll(".cart__row");
    let updatedSubtotal = 0;
    let bundleApplied = 0;

    jackets.forEach((jacket) => {
      const matchingRow = Array.from(cartItems).find(row => {
        const titleEl = row.querySelector(".cart__product-title a");
        const idEl = row.querySelector("input[name^='updates']");
        return (
          titleEl &&
          idEl &&
          titleEl.innerText.trim() === jacket.title.trim() &&
          idEl.name.includes(jacket.variant_id)
        );
      });

      if (matchingRow) {
        const priceEl = matchingRow.querySelector(".cart__price");
        const qty = jacket.quantity;
        const originalPriceEl = priceEl?.innerText.trim() || "";
        const originalPriceNum = parseFloat(originalPriceEl.replace(/[₹,]/g, ""));

        for (let i = 0; i < qty; i++) {
          if (bundleApplied < bundleCount * 2) {
            updatedSubtotal += jacketUnitPrice;
            bundleApplied++;
          } else {
            updatedSubtotal += originalPriceNum;
          }
        }

        if (priceEl) {
          if (bundleApplied >= qty) {
            priceEl.innerHTML = `<span style='text-decoration:line-through;color:gray;font-size:0.9em;'>₹${originalPriceNum.toLocaleString("en-IN")}</span><br><strong>₹${jacketUnitPrice.toLocaleString("en-IN")}</strong>`;
          } else if (bundleApplied === 0) {
            priceEl.innerHTML = `<strong>₹${originalPriceNum.toLocaleString("en-IN")}</strong>`;
          } else {
            const bundleQty = bundleCount * 2 - (bundleApplied - qty);
            const bundlePart = `₹${jacketUnitPrice.toLocaleString("en-IN")} x ${bundleQty}`;
            const regularPart = `₹${originalPriceNum.toLocaleString("en-IN")} x ${qty - bundleQty}`;
            priceEl.innerHTML = `<span style='text-decoration:line-through;color:gray;font-size:0.9em;'>₹${originalPriceNum.toLocaleString("en-IN")}</span><br><strong>${bundlePart} + ${regularPart}</strong>`;
          }
        }
      }
    });

    const subtotalEl = document.querySelector(".cart__subtotal .h3");
    if (subtotalEl) {
      const oldSubtotal = subtotalEl.innerText.trim();
      subtotalEl.innerHTML = `<span style='text-decoration:line-through;color:gray;font-size:0.9em;'>${oldSubtotal}</span><br><strong>₹${updatedSubtotal.toLocaleString("en-IN")}.00</strong>`;
    }

    const cartForm = document.querySelector("form[action='/cart']");
    const offerNote = document.createElement("p");
    const noteText = `Offer Applied: ${bundleCount * 2} Jacket(s) at ₹${(bundleCount * 2999).toLocaleString("en-IN")}` +
      (leftoverCount > 0 ? ` + ${leftoverCount} Jacket(s) at regular price` : ``);
    offerNote.innerHTML = `<em style='color:green;font-weight:600;'>${noteText}</em>`;
    offerNote.style.marginTop = "10px";
    cartForm.appendChild(offerNote);
  }
});
