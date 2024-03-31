const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const session = require('express-session');
const connection = require("./connection");
const cors = require('cors');

const signupRouter = require('./Controllers/SignUpRouter');
const loginRouter = require('./Controllers/LoginRouter');
const adminRouter = require('./Controllers/AdminRouter'); 
const employeeRouter = require('./Controllers/EmployeeRouter');
const passwordRouter = require('./Controllers/PasswordRouter');
const picturesRouter = require('./Controllers/PicturesRouter');
const taskRouter = require('./Controllers/TaskRouter');

const app = express();
const port = 8700;

app.use(express.json());
app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.json({ limit: '50mb', parameterLimit: 50000 }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));

app.use('/api/signUp', signupRouter);
app.use('/api/login', loginRouter);
app.use('/api/admin', adminRouter);
app.use('/api/employee', employeeRouter);
app.use('/api/password', passwordRouter);
app.use('/api/pictures', picturesRouter);
app.use('/api/task', taskRouter);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
     origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const connectedUsers = {}; // Corrected typo from 'onst' to 'const'

// Call handleSocketIO function to set up socket.io event handlers
// handleSocketIO(io);

  io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    // Event handler for setting userId
    socket.on('setUserId', (userId) => {
      // Store the userId along with the socket connection
      connectedUsers[userId.userId] = socket.id;
      console.log("Connected users:",Object.keys(connectedUsers));
      socket.emit('connectedWithId',Object.keys(connectedUsers));
      console.log("User connected with userId:", userId);

    
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

    // 
    socket.on("typingData", (data)=>{
      const receiptTyping = connectedUsers[data.userId]
      io.to(receiptTyping).emit("typing")
    })

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
      
      io.to(data.to).emit("callAccepted", data.signal );
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









    socket.emit("me", socket.id);

    // Function to check if a user is online
    socket.on("checkOnlineStatus", (id, callback) => {
      const isOnline = connectedUsers.hasOwnProperty(id);
      callback({ userId: id, isOnline });
      console.log("onlineStatus", { userId: id, isOnline });
    });
  });


app.get('/', (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.send('Server is Running.....');
});

app.get('/test', (req, res) => {
  res.send('Testing server....running');
});

server.listen(port, () => {
  console.log(`Server is running and accessible at http://localhost:${port}`);
});
