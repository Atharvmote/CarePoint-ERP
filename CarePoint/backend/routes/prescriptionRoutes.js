const router = require("express").Router();

const { protect } = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  createPrescription,
  getPatientPrescriptions,
  getPrescriptionsForDoctor,
  updatePrescription,
  markAsDispensed,
  deletePrescription,
  exportPDF
} = require("../controllers/prescriptionController");

// Doctor creates prescription
router.post("/", protect, role("doctor"), createPrescription);

// Patient gets their own prescriptions
router.get("/patient", protect, role("patient"), getPatientPrescriptions);

// Doctor gets patient's prescriptions
router.get("/doctor/:patientId", protect, role("doctor"), getPrescriptionsForDoctor);

// Doctor updates prescription
router.put("/:id", protect, role("doctor"), updatePrescription);

// Mark prescription as dispensed (could be pharmacy role)
router.put("/:id/dispense", protect, markAsDispensed);

// Doctor deletes prescription
router.delete("/:id", protect, role("doctor"), deletePrescription);

// Export prescription as PDF
router.get("/:id/export", protect, exportPDF);

module.exports = router;