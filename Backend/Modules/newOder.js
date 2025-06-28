const mongoose = require("mongoose");

const NewOrderSchema = new mongoose.Schema({
  ID: String,

        
        Product: String,
        
      Liters: String,
      Retailer:String,
      numberOfItems:String,

        NumberOfBoxes: String,
        PricePerItem: String,
        TotalPrice:String,
});

const NewOrder = mongoose.model("NewOrder", NewOrderSchema);

module.exports = NewOrder;
