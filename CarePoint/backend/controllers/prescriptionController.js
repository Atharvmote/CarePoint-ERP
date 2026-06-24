const Prescription = require("../models/Prescription");
const Appointment = require("../models/Appoinment");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { generatePrescriptionPDF } = require("../utils/pdfGenerator");

// CREATE PRESCRIPTION (Doctor creates during/after appointment)
exports.createPrescription = async (req, res) => {
  try {
    const { appointmentId, medications, diagnosis, notes, expiryDate } = req.body;

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId).populate(['patient', 'doctor']);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check if doctor is authorized
    if (appointment.doctor._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to create prescription for this appointment" });
    }

    const prescription = await Prescription.create({
      patient: appointment.patient,
      doctor: appointment.doctor,
      appointment: appointmentId,
      medications,
      diagnosis,
      notes,
      expiryDate: new Date(expiryDate),
      issuedDate: new Date()
    });

    // Populate for response
    const populatedPrescription = await prescription.populate(['doctor', 'patient']);

    // Save Notification and Emit socket event to patient
    const notification = await Notification.create({
      recipient: appointment.patient._id,
      type: "prescription-issued",
      title: "New Prescription",
      message: `New prescription issued by Dr. ${appointment.doctor.user?.name || "assigned doctor"}`,
      relatedId: populatedPrescription._id
    });

    if (req.io) {
      req.io.to(`user-${appointment.patient._id}`).emit("prescription-issued", {
        id: notification._id,
        type: "prescription-issued",
        title: "New Prescription",
        message: notification.message,
        prescription: populatedPrescription,
        timestamp: notification.createdAt
      });
    }

    res.status(201).json(populatedPrescription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET PATIENT PRESCRIPTIONS (Patient views their own prescriptions)
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user.id })
      .populate('doctor', 'user')
      .populate('appointment')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET PRESCRIPTIONS FOR DOCTOR (Doctor views patient's prescriptions)
exports.getPrescriptionsForDoctor = async (req, res) => {
  try {
    const { patientId } = req.params;

    const prescriptions = await Prescription.find({ patient: patientId })
      .populate('doctor', 'user')
      .populate('appointment')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE PRESCRIPTION
exports.updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    // Check if doctor is authorized
    if (prescription.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this prescription" });
    }

    const updatedPrescription = await Prescription.findByIdAndUpdate(id, updates, { new: true });
    res.json(updatedPrescription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// MARK PRESCRIPTION AS DISPENSED (Pharmacy)
exports.markAsDispensed = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findByIdAndUpdate(
      id,
      {
        dispensed: true,
        dispensedDate: new Date(),
        status: "completed"
      },
      { new: true }
    );

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.json(prescription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE PRESCRIPTION
exports.deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    // Check if doctor is authorized
    if (prescription.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this prescription" });
    }

    await Prescription.findByIdAndDelete(id);
    res.json({ message: "Prescription deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// EXPORT PRESCRIPTION AS PDF
exports.exportPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id)
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'user' }
      });

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    // Check if patient or doctor can access this prescription
    if (prescription.patient._id.toString() !== req.user.id && prescription.doctor._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to access this prescription" });
    }

    const doc = generatePrescriptionPDF(prescription, prescription.doctor, prescription.patient);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Prescription_${prescription._id}.pdf"`);

    doc.pipe(res);
    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};