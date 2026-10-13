const mongoose = require("mongoose");

const CreditorsSchema = new mongoose.Schema({

    CreditorID: String,
        
    Product: String,
    Date: String,
    Balance: String,
    Quantity: String,
   Paid: String,
    TotalPrice:String,
    Name:String,
});

const Creditors = mongoose.model("Creditors", CreditorsSchema);

module.exports = Creditors;
