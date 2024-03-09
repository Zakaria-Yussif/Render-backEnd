const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');

const signupRouter = require('./Controllers/SignUpRouter');
const loginRouter = require('./Controllers/LoginRouter');
const adminRouter = require('./Controllers/AdminRouter'); 
const employeeRouter = require('./Controllers/EmployeeRouter');
const passwordRouter = require('./Controllers/PasswordRouter');
const picturesRouter = require('./Controllers/PicturesRouter');
const taskRouter = require('./Controllers/TaskRouter');
const handleSocketIO = require('./Controllers/SocketRouter');

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
app.use('/', adminRouter);
app.use('/', employeeRouter);
app.use('/', passwordRouter);
app.use('/', picturesRouter);
app.use('/', taskRouter);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

handleSocketIO(io);

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
