const connection = require("../connection");
const ChatData = require('../Modules/chat');
const SimplePeer = require('simple-peer');
const wrtc = require('wrtc');

const connectedUsers = {};
  
const handleSocketIO = async (io) => {
  io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    // Event handler for setting userId
    socket.on('setUserId', (userId) => {
     connectedUsers[userId.userId]=socket.id
      
      console.log("Connected users:",Object.keys(connectedUsers));
      socket.emit('connectedWithId',Object.keys(connectedUsers));
    });
    // Event handler for disconnection
    socket.on('disconnect', () => {
      for (const [key, value] of Object.entries(connectedUsers)) {
        if (value === socket.id) {
          delete connectedUsers[key];
          console.log("User disconnected with userId:", key);
          io.emit("callEnd"); // Inform all clients about the call ending
          break;
        }
      }
    });

    socket.on("typing", ({ typedMessage, userId }) => {
      const recipientSocketId = connectedUsers[userId];
      // console.log("type", typedMessage);
      io.to(recipientSocketId).emit("typing", { Type: typedMessage });
    });

    socket.on('sendMessage', async ({ userId, Message, Img, Time, Name }) => {
      const recipientSocketId = connectedUsers[userId];
      // console.log("Recipient Socket ID:", recipientSocketId);

      if (recipientSocketId) {
        console.log("Recipient is online");
        io.to(recipientSocketId).emit('messageRev', { Message, userId, Img, Time, Name });
      } else {
        console.log("Recipient is offline");
      }

      console.log("Recipient Socket ID:", recipientSocketId);
    });

    socket.on("callUser", (data) => {
      // console.log(data)
      const dataFrom = connectedUsers[data.from]
      // console.log("dataFrom", dataFrom)
      const dataTo = connectedUsers[data.userToCall]
      // console.log("datato",dataTo);
      io.to(dataTo).emit("callUser", {
        signal: data.signalData,
        from: dataFrom,
        name: data.name,
        img:data.img,
      });
    });
  
    socket.on("answerCall", (data) => {
       console.log("Answering call from" ,data.to);
      // console.log(data)
      
      io.to(data.to).emit("callAccepted", data.signal , data.callImg);
    });
socket.on("rejectCall",(data)=>{
// const caller = connectedUsers[data.decodedId]
  console.log("re",data.decodedId)
  const img= data.imageUrl
 io.to(data.caller).emit("declineMessage", {message:' decline Call ', Id:data.decodedId })
})

    //Video Calling... severSide

      
     socket.on("callUserVideo", (data) => {
//  console.log(data)
  const dataFrom = connectedUsers[data.from]
//       // console.log("dataFrom", dataFrom)
   const dataTo = connectedUsers[data.userToCall]
//       // console.log("datato",dataTo);
     io.to(dataTo).emit("callUserVideo", {
   signal: data.signalData,
       from: dataFrom,
 name: data.name,
   img:data.img,
    });
  });
  
socket.on("answerCallVideo", (data) => {
//       // console.log(`Answering call from ${data.from}`);
    io.to(data.to).emit("callAcceptedVideo", data.signal);
   });
socket.on("rejectCallVideo",(data)=>{
 const caller = connectedUsers[data.decodedId]
//   console.log("re",data.decodedId)
  const img= data.imageUrl
 io.to(data.caller).emit("declineMessageVideo", {message:' decline Video Call ', Id:data.decodedId })
 })







    socket.on("checkOnlineStatus", (id, callback) => {
      const isOnline = connectedUsers.hasOwnProperty(id);
      callback({ userId: id, isOnline });
      console.log("onlineStatus", { userId: id, isOnline });
    });
  });
}

module.exports = handleSocketIO;
