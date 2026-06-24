const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  type: {
    type: String,   // bed / instrument / material
    required: true
  },

  total: Number,
  available: Number,

  status: {
    type: String,
    enum: ["Normal","Low","Critical"],
    default: "Normal"
  }

},{ timestamps:true });

module.exports = mongoose.model("Resource", resourceSchema);
