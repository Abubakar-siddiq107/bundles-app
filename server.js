import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.static("public"));
app.use(express.json());

const { SHOPIFY_API_TOKEN, SHOPIFY_STORE } = process.env;

app.post("/create-draft", async (req, res) => {
  const { items } = req.body;
  if (!items || items.length < 2) return res.status(400).send("Invalid items");

  const grouped = {};
  items.forEach(item => {
    const key = item.variant_id;
    grouped[key] = grouped[key] || { ...item, quantity: 0 };
    grouped[key].quantity += 1;
  });

  const line_items = [];
  let count = 0;
  for (const key in grouped) {
    const group = grouped[key];
    for (let i = 0; i < group.quantity; i++) {
      const discounted = count < Math.floor(items.length / 2) * 2;
      line_items.push({
        variant_id: group.variant_id,
        quantity: 1,
        price: discounted ? (2999 / 2).toFixed(2) : undefined,
        title: group.title
      });
      count++;
    }
  }

  try {
    const draftOrder = {
      draft_order: {
        line_items,
        use_customer_default_address: true
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
    console.error("Error:", err.response?.data || err.message);
    res.status(500).send("Failed to create draft order");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Bundle app running on port", process.env.PORT || 3000);
});
