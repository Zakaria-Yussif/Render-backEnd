const mongoose = require("mongoose")

const ChatDatasSchema = new mongoose.Schema({
    senderId: { type: String, required: true },
    userId: { type: String, required: true },
    Message: { type: String, required: true },
    Time:{ type: String, required: true },
    Img:{ type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});



const ChatDatas = new mongoose.model("ChatDatas", ChatDatasSchema);

module.exports=ChatDatas;