const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({

  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },

  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Slot"
  },

  reason: String,

  date: String,   // keep same as Slot
  time: String,

  status: {
    type: String,
    enum: ["scheduled", "in-progress", "completed", "cancelled"],
    default: "scheduled"
  },

  // Links to medical record and prescription created after appointment
  medicalRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MedicalRecord",
    default: null
  },

  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prescription",
    default: null
  },

  notes: String,  // Doctor's additional notes

  isEmergency: {
    type: Boolean,
    default: false
  },

  emergencyReason: {
    type: String,
    default: ""
  }

},{
  timestamps: true
});

// Add virtual for priority sorting (emergency=high, scheduled=low)
appointmentSchema.virtual('sortPriority').get(function() {
  if (this.isEmergency) return 1;
  if (this.status === 'in-progress') return 2;
  return 3;
});

module.exports = mongoose.model("Appointment", appointmentSchema);