const express = require('express');
const router = express.Router();
const multer = require("multer");
const nodemailer = require("nodemailer");
const Sales = require("../Modules/sales");
const twilio = require('twilio');
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken)

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




// Multer setup to receive file from form-data
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/sendReceipt", upload.single("file"), async (req, res) => {
  try {
    const { name, phone, email, total, receiptNo, date } = req.body;
    const receiptFile = req.file;

    if (!receiptFile || !email) {
      return res.status(400).json({ msg: "File or email missing" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "zakarias.yussif@gmail.com",
        pass: "quizcazzmqwwethj",
      },
    });

    const mailOptions = {
      from: "zakarias.yussif@gmail.com",
      to: email,
      subject: "Your Purchase Receipt - White Olives Ltd",
      html: `
        <div style="font-family: Arial, sans-serif; margin: 20px;">
          <h2>Thank you for your purchase, ${name}!</h2>
          <p>Here are the details of your transaction:</p>
          <ul>
            <li><strong>Receipt No:</strong> ${receiptNo}</li>
            <li><strong>Date:</strong> ${date}</li>
            <li><strong>Total:</strong> ₵${total}</li>
          </ul>
          <p>Your receipt is attached to this email.</p>
          <br/>
          <p style="font-size: 12px; color: gray;">White Olives Ltd — Agona-Ashanti</p>
        </div>
      `,
      attachments: [
        {
          filename: `${receiptNo}.pdf`,
          content: receiptFile.buffer,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ msg: "Receipt emailed successfully" });
  } catch (err) {
    console.error("Email sending error:", err);
    res.status(500).json({ msg: "Failed to send email" });
  }
});


// server.js
// POST /send-sms
router.post("/send-sms", async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({
      success: false,
      error: "Missing 'to' or 'message' in request body",
    });
  }

  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) {
    return res.status(500).json({
      success: false,
      error: "TWILIO_PHONE_NUMBER not configured in environment",
    });
  }

  try {
    console.log(`📨 Sending SMS from ${fromNumber} to ${to}`);

    const formattedTo = to.startsWith("+") ? to : `+${to}`;

    const response = await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to: formattedTo,
    });

    console.log("✅ SMS sent. SID:", response.sid);

    res.json({ success: true, sid: response.sid });
  } catch (error) {
    console.error("❌ Twilio SMS Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
module.exports = router;



