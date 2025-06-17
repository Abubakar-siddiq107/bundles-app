(async function () {
  const res = await fetch("/cart.js");
  const cart = await res.json();

  const jackets = cart.items.filter(item =>
    item.product_type?.toLowerCase() === "jacket"
  );

  if (jackets.length === 2) {
    const cleanItems = jackets.map(j => ({
      variant_id: j.variant_id,
      quantity: j.quantity,
      title: j.title
    }));

    const response = await fetch("https://bundles-app.onrender.com/create-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cleanItems })
    });

    const data = await response.json();
    if (data?.url) window.location.href = data.url;
  }
})();
