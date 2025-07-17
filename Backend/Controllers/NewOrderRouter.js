const express = require('express');
const router = express.Router();
const EmployeeList = require("../Modules/newOder"); // This seems to be your newOrder model
// const ProfileImgs = require("../Modules/profilePicture"); // Unused
// const session = require('express-session'); // Unused
// const connection = require("../connection"); // Unused

// ========== CREATE NEW ORDER ==========
router.post('/saveNewOrder', async (req, res) => {
  try {
    const {
      ID,
      Product,
      Liters,
      Retailer,
      numberOfItems,
      NumberOfBoxes,
      PricePerItem,
      TotalPrice
    } = req.body;

    const newOrder = await EmployeeList.create({
      ID,
      Product,
      Liters,
      Retailer,
      numberOfItems,
      NumberOfBoxes,
      PricePerItem,
      TotalPrice
    });

    console.log('New order created:', newOrder);
    res.status(200).json({ message: 'New order saved successfully', newOrder });
  } catch (error) {
    console.error('Error saving new order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// ========== GET NEW ORDERS ==========
router.get("/getNewOrder", async (req, res) => {
  try {
    const orders = await EmployeeList.find({});

    if (orders.length === 0) {
      return res.status(201).json({ message: 'No new orders available' });
    }

    // Ensure uniqueness by _id (MongoDB’s default unique field)
    const uniqueOrders = Array.from(new Map(orders.map(order => [order._id.toString(), order])).values());

    // console.log("Fetched unique orders:", uniqueOrders);
    return res.status(200).json({ message: "Fetched unique orders", uniqueArray: uniqueOrders });
  } catch (error) {
    console.error('Error fetching new orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// ========== UPDATE NEW ORDER ==========
router.post("/newOrderUpdates", async (req, res) => {
  try {
    const {
      _id,
      Product,
      Liters,
      Retailer,
      numberOfItems,
      NumberOfBoxes,
      PricePerItem,
      TotalPrice
    } = req.body;

    if (!_id) {
      return res.status(400).json({ error: "Missing order ID" });
    }

    const updatedOrder = await EmployeeList.findOneAndUpdate(
      { _id },
      {
        Product,
        Liters,
        Retailer,
        numberOfItems,
        NumberOfBoxes,
        PricePerItem,
        TotalPrice
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    // console.log("Order updated:", updatedOrder);
    res.status(200).json({ message: "Order updated successfully", data: updatedOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// ========== DELETE NEW ORDER ==========
router.post("/deleteNewOrder", async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({ error: "Missing order ID" });
    }

    const deletedOrder = await EmployeeList.findOneAndDelete({ _id });

    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    console.log("Deleted order:", deletedOrder);
    res.status(200).json({ message: "Order deleted successfully", deletedOrder });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
