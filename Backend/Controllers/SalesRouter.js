const express = require('express');
const router = express.Router();
const Sales = require("../Modules/sales");

router.post('/saveSales', async (req, res) => {
  try {
    const {
      checked,
      ID,
      Product,
      Status,
      Liters,
      Quantity,
      Price,
      TotalPrice,
      Name,
    } = req.body;

    const newSale = await Sales.create({
      ID,
      Product,
      Status,
      Liters,
      Quantity,
      Price,
      TotalPrice,
      Name,
    });

    console.log('Sale created:', newSale);
    res.status(200).json({ message: 'Sale created', newSale });
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get("/getSales", async (req, res) => {
  try {
    const salesList = await Sales.find({});
    if (salesList.length === 0) {
      console.log("No sales data found");
      return res.status(200).json({ message: 'No sales data found', sales: [] });
    }

    // Remove duplicates by _id (assuming _id is unique in MongoDB but in case duplicates happen)
    const uniqueSales = Array.from(new Map(salesList.map(item => [item._id.toString(), item])).values());

    console.log("Unique sales:", uniqueSales);
    return res.status(200).json({ message: "Sales retrieved", sales: uniqueSales });

  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post("/SalesUpdates", async (req, res) => {
  try {
    const {
      checked,
      _id,
      ID,
      Product,
      Status,
      Liters,
      Quantity,
      Price,
      TotalPrice,
      Name,
    } = req.body;

    if (!_id || typeof _id !== "string") {
      return res.status(400).json({ error: "Invalid or missing _id in the request." });
    }

    const existingSale = await Sales.findOne({ _id });
    if (!existingSale) {
      return res.status(404).json({ error: "Sale record not found." });
    }

    const updatedSale = await Sales.findOneAndUpdate(
      { _id },
      {
        ID,
        Product,
        Status,
        Liters,
        Quantity,
        Price,
        TotalPrice,
        Name,
      },
      { new: true }
    );

    console.log("Sale updated:", updatedSale);
    res.status(200).json({ message: "Sale updated successfully.", sale: updatedSale });
  } catch (error) {
    console.error("Error updating sale:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/deleteSales", async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id || typeof _id !== "string") {
      return res.status(400).json({ error: "Invalid or missing _id in the request." });
    }

    const saleToDelete = await Sales.findOne({ _id });
    if (!saleToDelete) {
      return res.status(404).json({ error: "Sale record not found." });
    }

    await Sales.deleteOne({ _id });

    console.log("Sale deleted:", saleToDelete);
    res.status(200).json({ message: "Sale deleted successfully.", sale: saleToDelete });
  } catch (error) {
    console.error("Error deleting sale:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
