require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require("socket.io");
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO BEFORE using it
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for debugging
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoute = require('./routes/auth');
const messageRoute = require('./routes/messages');
const notificationRoute = require('./routes/notifications');
const aiRoute = require('./routes/ai'); // New logic
const announcementRoute = require('./routes/announcements');
const adminRoute = require('./routes/admin');
const faqRoute = require('./routes/faq');
const fortnightRoute = require('./routes/fortnight');
const documentRoute = require('./routes/documents');
const evaluationRoute = require('./routes/evaluations');
const supervisorRequestRoute = require('./routes/supervisorRequests');

// Make io accessible to our router
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/auth', authRoute);
app.use('/api/messages', messageRoute);
app.use('/api/notifications', notificationRoute);
app.use('/api/ai', aiRoute);
app.use('/api/announcements', announcementRoute);
app.use('/api/admin', adminRoute);
app.use('/api/faq', faqRoute);
app.use('/api/fortnight', fortnightRoute);
app.use('/api/documents', documentRoute);
app.use('/api/evaluations', evaluationRoute);
app.use('/api/supervisor-requests', supervisorRequestRoute);

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

const PORT = 5000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_assistant_db')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
