const mongoose = require("mongoose");

const SalesSchema = new mongoose.Schema({

    ID: String,
        
    Product: String,
    Status: String,
    Liters: String,
    Quantity: String,
    Price: String,
    TotalPrice:String,
    Name:String,
});

const Sales = mongoose.model("Sales", SalesSchema);

module.exports = Sales;
