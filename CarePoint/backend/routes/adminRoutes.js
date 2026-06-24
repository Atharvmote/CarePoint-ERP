const router = require("express").Router();

const { protect } = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  getAllUsers,
  updateUser,
  deleteUser,
  getAllAppointments,
  rescheduleAppointment,
  reassignAppointment,
  getAnalytics,
  getSystemHealth,
  createStaff
} = require("../controllers/adminController");

// Admin users management
router.post("/staff", protect, role("admin"), createStaff);
router.get("/users", protect, role("admin"), getAllUsers);
router.put("/users/:id", protect, role("admin"), updateUser);
router.delete("/users/:id", protect, role("admin"), deleteUser);

// Admin appointments management
router.get("/appointments", protect, role("admin"), getAllAppointments);
router.put("/appointments/:id/reschedule", protect, role("admin"), rescheduleAppointment);
router.put("/appointments/:id/reassign", protect, role("admin"), reassignAppointment);

// Analytics
router.get("/analytics", protect, role("admin"), getAnalytics);
router.get("/health", protect, role("admin"), getSystemHealth);

module.exports = router;
