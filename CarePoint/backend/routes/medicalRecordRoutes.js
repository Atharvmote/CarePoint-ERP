const router = require("express").Router();

const { protect } = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  createMedicalRecord,
  getPatientMedicalRecords,
  getMedicalRecordsForDoctor,
  updateMedicalRecord,
  deleteMedicalRecord,
  exportPDF
} = require("../controllers/medicalRecordController");

// Doctor creates medical record
router.post("/", protect, role("doctor"), createMedicalRecord);

// Patient gets their own medical records
router.get("/patient", protect, role("patient"), getPatientMedicalRecords);

// Doctor gets patient's medical records
router.get("/doctor/:patientId", protect, role("doctor"), getMedicalRecordsForDoctor);

// Doctor updates medical record
router.put("/:id", protect, role("doctor"), updateMedicalRecord);

// Doctor deletes medical record
router.delete("/:id", protect, role("doctor"), deleteMedicalRecord);

// Export medical record as PDF
router.get("/:id/export", protect, exportPDF);

module.exports = router;