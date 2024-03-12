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
app.use('/', employeeRouter);
app.use('/api/resetPassword', passwordRouter);
app.use('/api/pictures', picturesRouter);
app.use('/', taskRouter);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    // origin: 'https://mern-stack-app22.onrender.com',
    origin:'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const connectedUsers = {}; // Corrected typo from 'onst' to 'const'

// Call handleSocketIO function to set up socket.io event handlers
handleSocketIO(io);

function handleSocketIO(io) {
  io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    // Event handler for setting userId
    socket.on('setUserId', (userId) => {
      // Store the userId along with the socket connection
      connectedUsers[userId] = socket.id;
      console.log("User connected with userId:", userId);

      socket.emit('connectedWithId', userId);
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

    // Event handler for sending messages
    socket.on("send_message", (data) => {
      socket.broadcast.emit("received_message", data);
    });

    // Event handler for callUser
    socket.on("callUser", (data) => {
      io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name });
    });

    // Event handler for answerCall
    socket.on("answerCall", (data) => {
      io.to(data.to).emit("callAccepted", data.signal);
    });

    // Emitting the socket ID to the client
    socket.emit("me", socket.id);

    // Function to check if a user is online
    socket.on("checkOnlineStatus", (id, callback) => {
      const isOnline = connectedUsers.hasOwnProperty(id);
      callback({ userId: id, isOnline });
      console.log("onlineStatus", { userId: id, isOnline });
    });
  });
}

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
