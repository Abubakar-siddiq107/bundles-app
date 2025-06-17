const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("public"));
app.use(express.json());

// Access environment variables from Render dashboard
const SHOPIFY_API_TOKEN = process.env.SHOPIFY_API_TOKEN;
const SHOPIFY_STORE = process.env.SHOPIFY_STORE;

app.post("/create-draft", async (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) return res.status(400).send("Invalid items");

  try {
    // Flatten all jacket units
    const allJackets = [];
    items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        allJackets.push({
          variant_id: item.variant_id,
          title: item.title
        });
      }
    });

    const bundlePairs = Math.floor(allJackets.length / 2);
    const leftover = allJackets.length % 2;

    const line_items = [];

    // Add bundled jackets at ₹1499.5 each
    for (let i = 0; i < bundlePairs * 2; i++) {
      line_items.push({
        title: allJackets[i].title,
        price: "1499.5",
        quantity: 1,
        taxable: true
      });
    }

    // Add leftover jackets at original price using variant_id
    for (let i = bundlePairs * 2; i < allJackets.length; i++) {
      line_items.push({
        variant_id: allJackets[i].variant_id,
        quantity: 1,
        taxable: true
      });
    }

    const draftOrder = {
      draft_order: {
        line_items
      }
    };

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
