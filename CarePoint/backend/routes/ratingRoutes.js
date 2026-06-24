const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  createRating,
  getDoctorRatings,
  getAppointmentRating,
  updateRating,
  deleteRating,
  getPatientRatings
} = require("../controllers/ratingController");

// Patient creates rating
router.post("/", protect, role("patient"), createRating);

// Get ratings for a doctor (public)
router.get("/doctor/:doctorId", getDoctorRatings);

// Get rating for specific appointment
router.get("/appointment/:appointmentId", getAppointmentRating);

// Get patient's own ratings
router.get("/patient/my-ratings", protect, role("patient"), getPatientRatings);

// Update rating
router.put("/:id", protect, role("patient"), updateRating);

// Delete rating
router.delete("/:id", protect, role("patient"), deleteRating);

module.exports = router;
