const express = require("express");
const app = express();
const path = require("path");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Bundles App Running");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port 3000");
});
