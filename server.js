require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Webhook or frontend trigger endpoint
app.post('/create-bundle-order', async (req, res) => {
  try {
    const cart = req.body.cart; // Expects [{product_id, title, quantity, price}, ...]
    const jackets = cart.filter(item => item.title.toLowerCase().includes("jacket"));
    
    if (jackets.length >= 2) {
      const line_items = jackets.slice(0, 2).map(item => ({
        title: item.title,
        quantity: 1,
        price: 1499.5  // ₹2999 split evenly
      }));

      const response = await axios.post(
        `https://${process.env.SHOPIFY_STORE}/admin/api/2023-07/draft_orders.json`,
        {
          draft_order: {
            line_items,
            note: "Auto Bundle: 2 Jackets for ₹2999",
            use_customer_default_address: true
          }
        },
        {
          headers: {
            "X-Shopify-Access-Token": process.env.SHOPIFY_API_TOKEN,
            "Content-Type": "application/json"
          }
        }
      );

      const draftOrder = response.data.draft_order;
      return res.json({ checkout_url: draftOrder.invoice_url });
    }

    return res.status(400).json({ error: "Cart does not contain 2 jackets" });
  } catch (error) {
    console.error("Error creating bundle order:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => console.log(`Bundles App running on ${port}`));
