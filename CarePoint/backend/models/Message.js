const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      index: true
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    content: {
      type: String,
      required: true,
      trim: true
    },

    messageType: {
      type: String,
      enum: ["text", "report", "prescription", "medical-record"],
      default: "text"
    },

    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String, // "pdf", "image", "doc", etc.
        fileSize: Number,
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    isRead: {
      type: Boolean,
      default: false
    },

    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    indexes: [
      { appointment: 1, createdAt: -1 },
      { sender: 1 },
      { receiver: 1 },
      { isRead: 1 }
    ]
  }
);

// Method to mark message as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

module.exports = mongoose.model("Message", messageSchema);
