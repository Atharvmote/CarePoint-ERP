const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  createDoctor,
  getDoctors,
  updateDoctor,
  startWork,
  endWork,
  getDoctorDashboard,
  getMyDoctor,
  getPatientHistory
} = require("../controllers/doctorController");

router.post("/", protect, role("admin"), createDoctor);
router.get("/", getDoctors);
router.get("/me", protect, getMyDoctor);
router.get("/dashboard", protect, getDoctorDashboard);
router.get("/patient-history/:patientId", protect, role("doctor"), getPatientHistory);
router.put("/start-work", protect, startWork);
router.put("/end-work", protect, endWork);

router.put("/:id", protect, updateDoctor); // update routes (keep dynamic router alway last)

module.exports = router;
