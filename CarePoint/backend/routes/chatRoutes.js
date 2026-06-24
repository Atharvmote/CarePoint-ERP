const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const chatController = require("../controllers/chatController");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/chat-reports/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    // Allow documents, images, and PDFs
    const allowedMimes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, images, and documents allowed."));
    }
  }
});

// All routes require authentication
router.use(protect);

// Get chat history for an appointment
router.get("/history/:appointmentId", chatController.getChatHistory);

// Send a message
router.post("/send", upload.array("attachments", 5), chatController.sendMessage);

// Mark message as read
router.patch("/read/:messageId", chatController.markAsRead);

// Mark all messages in chat as read
router.patch("/read-all/:appointmentId", chatController.markChatAsRead);

// Get unread count
router.get("/unread-count", chatController.getUnreadCount);

// Delete a message
router.delete("/:messageId", chatController.deleteMessage);

module.exports = router;
