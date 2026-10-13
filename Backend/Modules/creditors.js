const mongoose = require("mongoose");

const CreditorsSchema = new mongoose.Schema({
CreditorID:String,
    Name:String,
    Balance:String,
    Date:String,
    Quantity:String,
    Product:String,
    Paid:String,
    TotalPrice:String,
});

const Creditors = mongoose.model("Creditors", CreditorsSchema);

module.exports = Creditors;
