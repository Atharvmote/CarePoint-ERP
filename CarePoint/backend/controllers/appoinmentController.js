const Appointment = require("../models/Appoinment");
const Doctor = require("../models/Doctor");
const Slot = require("../models/Slot");
const MedicalRecord = require("../models/MedicalRecord");
const Prescription = require("../models/Prescription");
const Notification = require("../models/Notification");
const { notifyUser } = require("../utils/notify");


// CREATE APPOINTMENT (Patient books)

exports.createAppointment = async (req, res) => {
  try {

    const { slotId, reason } = req.body;

    console.log(req.user);

    // 1️⃣ find slot
    const slot = await Slot.findById(slotId).populate('doctor');

    if (!slot)
      return res.status(404).json({ message: "Slot not found" });

    // 2️⃣ check if already booked
    if (slot.status === "Booked") {
      return res.status(400).json({
        message: "Slot already booked"
      });
    }

    // 3️⃣ create appointment
    const appointment = await Appointment.create({
      doctor: slot.doctor._id,
      patient: req.user.id,
      slot: slot._id,
      date: slot.date,
      time: slot.time,
      reason
    });

    // Populate for response
    const populatedAppointment = await appointment.populate(['doctor', 'patient']);

    // 4️⃣ mark slot booked
    slot.status = "Booked";
    await slot.save();

    // 5️⃣ Save Notification and Emit socket event to doctor
    const doctor = await Doctor.findById(slot.doctor._id).populate('user');
    if (doctor && doctor.user) {
      const notification = await Notification.create({
        recipient: doctor.user._id,
        type: "appointment-scheduled",
        title: "New Appointment",
        message: `New appointment scheduled by ${populatedAppointment.patient.name}`,
        relatedId: populatedAppointment._id
      });
      
      if (req.io) {
        req.io.to(`user-${doctor.user._id}`).emit("appointment-scheduled", {
          id: notification._id,
          type: "appointment-scheduled",
          title: "New Appointment",
          message: notification.message,
          appointment: populatedAppointment,
          timestamp: notification.createdAt
        });
      }
    }

    res.status(201).json(populatedAppointment);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// GET DOCTOR APPOINTMENTS
exports.getDoctorAppointments = async (req, res) => {
  try {

    const doctor = await Doctor.findOne({ user: req.user.id });

    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate("patient", "name email");

    res.json(appointments);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//CANCELING appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate(['doctor', 'patient']);

    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    // only allow cancel if scheduled
    if (appointment.status !== "scheduled") {
      return res.status(400).json({
        message: "Cannot cancel this appointment"
      });
    }

    // 🔥 update appointment
    appointment.status = "cancelled";
    await appointment.save();

    // 🔥 FREE THE SLOT
    if (appointment.slot) {
      await Slot.findByIdAndUpdate(appointment.slot, {
        status: "Available"
      });
    }

    // Save Notification and Emit socket event to the other party
    // Check who is cancelling
    const isPatientCancelling = req.user.role === 'patient';
    const recipientId = isPatientCancelling ? 
      (await Doctor.findById(appointment.doctor._id)).user : 
      appointment.patient._id;
      
    if (recipientId) {
      const notification = await Notification.create({
        recipient: recipientId,
        type: "appointment-cancelled",
        title: "Appointment Cancelled",
        message: `Appointment cancelled by ${req.user.name || (isPatientCancelling ? 'Patient' : 'Doctor')}`,
        relatedId: appointment._id
      });

      if (req.io) {
        req.io.to(`user-${recipientId}`).emit("appointment-cancelled", {
          id: notification._id,
          type: "appointment-cancelled",
          title: "Appointment Cancelled",
          message: notification.message,
          appointment,
          timestamp: notification.createdAt
        });
      }
    }

    res.json({ message: "Appointment cancelled successfully", appointment });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// GET PATIENT APPOINTMENTS
exports.getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.user.id
    }).populate({
      path: "doctor",
      select:"specialty",
      populate: {
        path: "user",
        select: "name"
      }
    });

    res.json(appointments);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// START APPOINTMENT
exports.startAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('patient doctor');

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only allow starting if appointment is in 'scheduled' status
    if (appointment.status !== "scheduled") {
      return res.status(400).json({
        message: `Cannot start appointment. Current status is '${appointment.status}'.`
      });
    }

    appointment.status = "in-progress";
    await appointment.save();

    // Notify patient via database
    const patientNotification = await Notification.create({
      recipient: appointment.patient._id,
      type: "appointment-started",
      title: "Appointment Started",
      message: "Your doctor has started the appointment. Chat is now available.",
      relatedId: appointment._id
    });

    // Emit real-time notification to patient
    if (req.io) {
      req.io.to(`user-${appointment.patient._id}`).emit("appointment-started", {
        id: patientNotification._id,
        type: "appointment-started",
        title: "Appointment Started",
        message: patientNotification.message,
        appointment: appointment,
        timestamp: patientNotification.createdAt
      });
    }

    res.json(appointment);

  } catch (err) {
    console.error('Start appointment error:', err);
    res.status(500).json({ message: err.message });
  }
};


// COMPLETE APPOINTMENT WITH MEDICAL RECORD & PRESCRIPTION
exports.completeAppointment = async (req, res) => {
  try {
    const { medicalRecordData, prescriptionData, notes } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Get doctor's user reference
    const doctor = await Doctor.findById(appointment.doctor);
    
    // Check if doctor is authorized
    if (doctor.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 1️⃣ Create medical record if provided
    let medicalRecordId = null;
    if (medicalRecordData && (medicalRecordData.chiefComplaint || medicalRecordData.diagnosis)) {
      const record = await MedicalRecord.create({
        patient: appointment.patient,
        doctor: appointment.doctor,
        appointment: appointment._id,
        symptoms: medicalRecordData.chiefComplaint ? [medicalRecordData.chiefComplaint] : [],
        diagnosis: Array.isArray(medicalRecordData.diagnosis) ? medicalRecordData.diagnosis.join(", ") : medicalRecordData.diagnosis,
        treatment: medicalRecordData.treatment,
        vitalSigns: medicalRecordData.vitalSigns,
        notes: medicalRecordData.notes,
        followUpNotes: medicalRecordData.followUp,
        status: "finalized"
      });
      medicalRecordId = record._id;
    }

    // 2️⃣ Create prescription if provided
    let prescriptionId = null;
    if (prescriptionData && prescriptionData.medications && prescriptionData.medications.length > 0) {
      // Add defaults to prevent Mongoose validation crashes
      if (!prescriptionData.expiryDate) {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        prescriptionData.expiryDate = d;
      }
      
      const mappedMedications = prescriptionData.medications.map(m => ({
        name: m.name,
        dosage: m.dosage || "As prescribed",
        frequency: m.frequency || "1x daily",
        duration: m.duration || "7 days",
        instructions: m.instructions || "",
        quantity: m.quantity || 1
      }));

      const prescription = await Prescription.create({
        patient: appointment.patient,
        doctor: appointment.doctor,
        appointment: appointment._id,
        diagnosis: prescriptionData.diagnosis,
        medications: mappedMedications,
        notes: prescriptionData.notes,
        expiryDate: prescriptionData.expiryDate,
        status: "active",
        issuedDate: new Date()
      });
      prescriptionId = prescription._id;
    }

    // 3️⃣ Update appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        status: "completed",
        medicalRecord: medicalRecordId,
        prescription: prescriptionId,
        notes
      },
      { new: true }
    ).populate("medicalRecord prescription");

    await notifyUser(req, updatedAppointment.patient, "status-update", "Appointment Completed", "Your appointment has been completed.", updatedAppointment._id);

    res.json(updatedAppointment);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// MARK APPOINTMENT AS EMERGENCY
exports.markEmergency = async (req, res) => {
  try {
    const { emergencyReason } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only patient can mark as emergency
    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        isEmergency: true,
        emergencyReason: emergencyReason || ""
      },
      { new: true }
    ).populate("doctor", "user");

    if (updated.doctor && updated.doctor.user) {
      await notifyUser(req, updated.doctor.user._id, "status-update", "Emergency Appointment!", `An appointment was marked as an emergency: ${emergencyReason || "Immediate attention required"}`, updated._id);
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET EMERGENCY APPOINTMENTS
exports.getEmergencyAppointments = async (req, res) => {
  try {
    const emergencies = await Appointment.find({ isEmergency: true })
      .populate("patient", "name email")
      .populate("doctor", "user specialty")
      .sort({ createdAt: -1 });

    res.json(emergencies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};