const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true
  },

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

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  review: {
    type: String,
    default: ""
  },

  categories: {
    communication: { type: Number, min: 1, max: 5, default: 5 },
    professionalism: { type: Number, min: 1, max: 5, default: 5 },
    punctuality: { type: Number, min: 1, max: 5, default: 5 },
    cleanliness: { type: Number, min: 1, max: 5, default: 5 }
  }

}, { timestamps: true });

module.exports = mongoose.model("Rating", ratingSchema);
