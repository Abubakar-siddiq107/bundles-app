(async function () {
  const response = await fetch("/cart.js");
  const cart = await response.json();
  const jackets = cart.items.filter(item =>
    item.product_type.toLowerCase() === "jacket"
  );

  if (jackets.length === 2) {
    const total = jackets.reduce((sum, j) => sum + j.final_line_price, 0);
    const bundleTotal = 299900;
    const discount = Math.round((total - bundleTotal) / 2);

    for (let jacket of jackets) {
      await fetch("/cart/change.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: jacket.key,
          quantity: jacket.quantity,
          properties: {
            _bundle: "Jacket Bundle Applied",
            _adjusted_price: `₹${((jacket.final_line_price - discount) / 100).toFixed(2)}`
          }
        })
      });
    }

    location.reload();
  }
})();
