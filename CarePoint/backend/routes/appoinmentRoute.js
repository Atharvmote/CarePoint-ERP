const router = require("express").Router();

const { protect } = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  createAppointment,
  getDoctorAppointments,
  getPatientAppointments,
  startAppointment,
  completeAppointment,
  cancelAppointment,
  markEmergency,
  getEmergencyAppointments
} = require("../controllers/appoinmentController");


// Patient books appointment
router.post("/", protect, role("patient"), createAppointment);

// Patient gets his appointments
router.get("/patient", protect, role("patient"), getPatientAppointments);


// Doctor gets his appointments
router.get("/doctor", protect, role("doctor"), getDoctorAppointments);


// Doctor starts appointment
router.put("/:id/start", protect, role("doctor"), startAppointment);


// Doctor completes appointment
router.put("/:id/complete", protect, role("doctor"), completeAppointment);

// patitnet cancle appointets
router.put("/:id/cancel", protect, role("patient"), cancelAppointment);

// Patient marks appointment as emergency
router.put("/:id/emergency", protect, role("patient"), markEmergency);

// Get all emergency appointments
router.get("/emergency/all", protect, role("doctor", "admin"), getEmergencyAppointments);

module.exports = router;