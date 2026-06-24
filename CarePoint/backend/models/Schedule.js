const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },
  
  // Weekly schedule (Monday-Sunday)
  schedule: [
    {
      dayOfWeek: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        required: true
      },
      startTime: String, // HH:MM format (e.g., "09:00")
      endTime: String,   // HH:MM format (e.g., "17:00")
      isActive: { type: Boolean, default: true }
    }
  ],
  
  // Blocked dates (doctor not available)
  blockedDates: [
    {
      date: Date,
      reason: String
    }
  ],
  
  // Break times on specific days
  breaks: [
    {
      dayOfWeek: String,
      startTime: String,
      endTime: String,
      reason: String
    }
  ],

  slotDuration: { type: Number, default: 30 }, // in minutes

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Schedule", scheduleSchema);
