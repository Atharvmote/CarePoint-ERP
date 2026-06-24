const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema({
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

  // Medical History
  medicalHistory: {
    pastConditions: [String],
    surgeries: [String],
    allergies: [String],
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String
    }],
    familyHistory: [String]
  },

  // Current Visit Details
  symptoms: [String],
  diagnosis: String,
  treatment: String,
  notes: String,

  // Vital Signs
  vitalSigns: {
    bloodPressure: String,
    temperature: String,
    heartRate: String,
    weight: String,
    height: String,
    bmi: String
  },

  // Lab Results (can store file paths or URLs)
  labResults: [{
    testName: String,
    result: String,
    normalRange: String,
    date: Date,
    fileUrl: String
  }],

  // Follow-up
  followUpDate: Date,
  followUpNotes: String,

  status: {
    type: String,
    enum: ["draft", "finalized"],
    default: "draft"
  }

}, { timestamps: true });

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);