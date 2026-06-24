const router = require("express").Router();

const { protect } = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  getDoctorSchedule,
  getMySchedule,
  createOrUpdateSchedule,
  addBlockedDate,
  removeBlockedDate,
  addBreak,
  removeBreak
} = require("../controllers/scheduleController");

// Get specific doctor's schedule
router.get("/:doctorId", getDoctorSchedule);

// Get logged-in doctor's schedule
router.get("/", protect, role("doctor"), getMySchedule);

// Create or update schedule
router.put("/", protect, role("doctor"), createOrUpdateSchedule);

// Add blocked date
router.post("/blocked-date", protect, role("doctor"), addBlockedDate);

// Remove blocked date
router.delete("/blocked-date/:blockedDateId", protect, role("doctor"), removeBlockedDate);

// Add break
router.post("/break", protect, role("doctor"), addBreak);

// Remove break
router.delete("/break/:breakId", protect, role("doctor"), removeBreak);

module.exports = router;
