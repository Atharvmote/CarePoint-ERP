const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const socketIo = require("socket.io");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const errorHandler = require("./middleware/errorHandler");
const logger = require("./middleware/logger");
const { initializeWebRTCSignaling } = require("./utils/webrtcSignaling");
const { initializeChatSignaling } = require("./utils/chatSignaling");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"] : ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
  },
  transports: ["websocket", "polling"],
  pingInterval: 30000, // Optimize ping interval
  pingTimeout: 60000
});

// Store connected users (userId -> socketId mapping)
const connectedUsers = {};

// Socket events
io.on("connection", (socket) => {
  console.log("New WebSocket connection:", socket.id);

  // Register user
  socket.on("user-online", (userId) => {
    connectedUsers[userId] = socket.id;
    socket.join(`user-${userId}`);
    console.log(`User ${userId} is online`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    // Remove user from connected list
    for (let userId in connectedUsers) {
      if (connectedUsers[userId] === socket.id) {
        delete connectedUsers[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Initialize WebRTC Signaling
initializeWebRTCSignaling(io);

// Initialize Chat Signaling
initializeChatSignaling(io);

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  req.connectedUsers = connectedUsers;
  next();
});

// Rate limiter - prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later"
});

// middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(compression()); // Enable gzip compression
app.use(limiter); // Apply rate limiter
app.use(cors({
  origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"] : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));
app.use(helmet());
app.use(logger);

// Cache headers for static assets
app.use((req, res, next) => {
  if (req.url.startsWith("/api/")) {
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  }
  next();
});

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/test", require("./routes/testRoutes"));
app.use("/api/inquiries", require("./routes/inquiryRoutes"));
app.use("/api/slots", require("./routes/slotRoutes"));
app.use("/api/doctors", require("./routes/doctorRoutes"));
app.use("/api/resources", require("./routes/resourceRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/appointments", require("./routes/appoinmentRoute.js"));
app.use("/api/medical-records", require("./routes/medicalRecordRoutes"));
app.use("/api/prescriptions", require("./routes/prescriptionRoutes"));
app.use("/api/ratings", require("./routes/ratingRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/schedule", require("./routes/scheduleRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// error handler MUST be last
app.use(errorHandler);

// DB connection with connection pooling
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10, // Connection pooling
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// start server
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
  });
}

// Export for Vercel
module.exports = app;
