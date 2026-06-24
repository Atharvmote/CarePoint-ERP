const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema({
  patientName: String,
  phone: String,
  email: String,
  department: String,
  message: String,

  status: {
    type: String,
    enum: ["New", "Contacted", "Slot Confirmed"],
    default: "New"
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

},{ timestamps:true });

module.exports = mongoose.model("Inquiry", inquirySchema);
