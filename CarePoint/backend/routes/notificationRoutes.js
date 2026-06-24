const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

// All notification routes require authentication
router.use(protect);

router.get("/", notificationController.getNotifications);
router.put("/:id/read", notificationController.markAsRead);
router.delete("/", notificationController.clearAll);

module.exports = router;
