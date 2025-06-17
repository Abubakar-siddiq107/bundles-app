const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

app.use(cors({
  origin: "https://knkas.myshopify.com",  // ✅ Only allow your Shopify store
  methods: ["POST", "GET"],
  credentials: true
}));

app.use(express.static("public"));
app.use(express.json());

const { SHOPIFY_API_TOKEN, SHOPIFY_STORE } = process.env;

app.post("/create-draft", async (req, res) => {
  const { items } = req.body;
  if (!items || items.length !== 2) return res.status(400).send("Invalid items");

  try {
    const draftOrder = {
      draft_order: {
        line_items: items.map(item => ({
          title: item.title,
          price: (2999 / 2).toFixed(2),
          quantity: item.quantity,
          taxable: true
        }))
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
