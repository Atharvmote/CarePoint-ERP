const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor"
  },

  date: String,
  time: String,

  status: {
    type: String,
    enum: ["Available","Booked"],
    default: "Available"
  },

  patientName: String,

},{timestamps:true});

module.exports = mongoose.model("Slot", slotSchema);
