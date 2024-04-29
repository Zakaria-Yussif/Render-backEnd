const mongoose = require("mongoose")

// submitReportModel.js


const reportSubmitDataSchema = new mongoose.Schema({
    messageEvent: String,
    messageFollow: String,
    messageReco: String,
    nameReport: String
});

const taskSubmitData = mongoose.model("taskSubmitData", reportSubmitDataSchema);

module.exports = taskSubmitData;
