const MedicalRecord = require("../models/MedicalRecord");
const Appointment = require("../models/Appoinment");
const User = require("../models/User");
const { generateMedicalRecordPDF } = require("../utils/pdfGenerator");

// CREATE MEDICAL RECORD (Doctor creates during/after appointment)
exports.createMedicalRecord = async (req, res) => {
  try {
    const { appointmentId, medicalHistory, symptoms, diagnosis, treatment, notes, vitalSigns, labResults, followUpDate, followUpNotes } = req.body;

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId).populate('patient').populate({
      path: 'doctor',
      populate: { path: 'user' }
    });
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check if doctor is authorized (compare doctor's user ID with current user)
    if (appointment.doctor.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to create medical record for this appointment" });
    }

    const medicalRecord = await MedicalRecord.create({
      patient: appointment.patient._id,
      doctor: appointment.doctor._id,
      appointment: appointmentId,
      medicalHistory,
      symptoms,
      diagnosis,
      treatment,
      notes,
      vitalSigns,
      labResults,
      followUpDate,
      followUpNotes,
      status: "finalized"
    });

    res.status(201).json(medicalRecord);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET PATIENT MEDICAL RECORDS (Patient views their own records)
exports.getPatientMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.user.id })
      .populate('doctor', 'user')
      .populate('appointment')
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET MEDICAL RECORDS FOR DOCTOR (Doctor views patient's records)
exports.getMedicalRecordsForDoctor = async (req, res) => {
  try {
    const { patientId } = req.params;

    const records = await MedicalRecord.find({ patient: patientId })
      .populate('doctor', 'user')
      .populate('appointment')
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE MEDICAL RECORD
exports.updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const record = await MedicalRecord.findById(id).populate({
      path: 'doctor',
      populate: { path: 'user' }
    });
    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    // Check if doctor is authorized
    if (record.doctor.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this medical record" });
    }

    const updatedRecord = await MedicalRecord.findByIdAndUpdate(id, updates, { new: true });
    res.json(updatedRecord);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE MEDICAL RECORD
exports.deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await MedicalRecord.findById(id).populate({
      path: 'doctor',
      populate: { path: 'user' }
    });
    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    // Check if doctor is authorized
    if (record.doctor.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this medical record" });
    }

    await MedicalRecord.findByIdAndDelete(id);
    res.json({ message: "Medical record deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// EXPORT MEDICAL RECORD AS PDF
exports.exportPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await MedicalRecord.findById(id)
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'user' }
      });

    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    // Check if patient or doctor can access this record
    if (record.patient._id.toString() !== req.user.id && record.doctor._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to access this record" });
    }

    const doc = generateMedicalRecordPDF(record, record.doctor, record.patient);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="MedicalRecord_${record._id}.pdf"`);

    doc.pipe(res);
    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};