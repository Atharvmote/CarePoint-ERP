const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },

  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment"
  },

  medications: [{
    name: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    instructions: String,
    quantity: Number
  }],

  // Prescription Details
  diagnosis: String,
  notes: String,

  // Validity
  issuedDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },

  // Status
  status: {
    type: String,
    enum: ["active", "completed", "expired"],
    default: "active"
  },

  // Pharmacy Information
  pharmacyNotes: String,
  dispensed: {
    type: Boolean,
    default: false
  },
  dispensedDate: Date

}, { timestamps: true });

module.exports = mongoose.model("Prescription", prescriptionSchema);