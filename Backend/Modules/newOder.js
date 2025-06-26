const mongoose = require("mongoose");

const NewOrderSchema = new mongoose.Schema({
  ID: String,
  Product: String,
  Boxes: String,
  Liters: String,
  Retailer: String,
  Quantity: String,
  Price: String,
  TotalPrice: String,
});

const NewOrder = mongoose.model("NewOrder", NewOrderSchema);

module.exports = NewOrder;
