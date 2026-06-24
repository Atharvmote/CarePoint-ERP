const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  
  name: { type: String, index: true },
  email: { type: String, index: true, unique: true },
  phone: String,
  specialty: { type: String, index: true },
  experience: String,
  qualification: String,
  fee: Number,
  rating: Number,

  status: {
    type: String,
    enum: ["offline", "online", "busy"],
    default: "offline",
    index: true
  },

  currentShiftStart: {
    type: Date,
    default: null
  },

  workSecondsToday: {
    type: Number,
    default: 0
  },

  lastWorkDate: {
    type: String,
    default: ""
  }

}, { timestamps: true });

// Compound index for common queries
doctorSchema.index({ specialty: 1, status: 1 });
doctorSchema.index({ createdAt: -1 }); // For sorting by newest

module.exports = mongoose.model("Doctor", doctorSchema);