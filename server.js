const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("public"));
app.use(express.json());

// Render environment variables
const { SHOPIFY_API_TOKEN, SHOPIFY_STORE } = process.env;

app.post("/create-draft", async (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) return res.status(400).send("Invalid items");

  try {
    // Filter jacket items only
    const jackets = items.filter(item => item.product_type?.toLowerCase() === "jacket");

    // Separate bundle jackets and extra jackets
    const bundledPairs = Math.floor(jackets.length / 2);
    const extraJackets = jackets.length % 2;

    // Line items for draft order
    const line_items = [];

    // Add bundled jackets (₹1499 each)
    let jacketsAdded = 0;
    for (let i = 0; i < items.length && jacketsAdded < bundledPairs * 2; i++) {
      const item = items[i];
      if (item.product_type?.toLowerCase() === "jacket") {
        line_items.push({
          variant_id: item.variant_id,
          quantity: item.quantity,
          title: item.title,
          price: (2999 / 2).toFixed(2),
          taxable: true,
        });
        jacketsAdded++;
      }
    }

    // Add remaining jackets and non-jacket products at original price
    for (let item of items) {
      const isJacket = item.product_type?.toLowerCase() === "jacket";
      const alreadyAdded = line_items.find(li => li.variant_id === item.variant_id);
      const eligibleForBundle = isJacket && jacketsAdded-- > 0;

      if (!eligibleForBundle && !alreadyAdded) {
        line_items.push({
          variant_id: item.variant_id,
          quantity: item.quantity,
          title: item.title,
          // price is omitted to use default Shopify price
          taxable: true,
        });
      }
    }

    const draftOrder = { draft_order: { line_items } };

    const response = await axios.post(
      `https://${SHOPIFY_STORE}/admin/api/2023-10/draft_orders.json`,
      draftOrder,
      {
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_API_TOKEN,
          "Content-Type": "application/json"
        }
      }
    );

    const invoiceUrl = response.data.draft_order.invoice_url;
    res.json({ url: invoiceUrl });

  } catch (err) {
    console.error("Error creating draft order:", err.response?.data || err.message);
    res.status(500).send("Error creating draft order");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running...");
});
