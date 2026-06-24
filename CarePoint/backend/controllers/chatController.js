const Message = require("../models/Message");
const Appointment = require("../models/Appoinment");
const User = require("../models/User");
const asyncWrap = require("../utils/asyncWrap");

// Get chat history for an appointment
exports.getChatHistory = asyncWrap(async (req, res) => {
  const { appointmentId } = req.params;
  const { limit = 50, skip = 0 } = req.query;

  // Verify user is part of the appointment
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  const userId = req.user._id;
  const isParticipant = appointment.doctor.equals(userId) || appointment.patient.equals(userId);
  
  if (!isParticipant) {
    return res.status(403).json({ message: "Unauthorized access to chat" });
  }

  const messages = await Message.find({ appointment: appointmentId })
    .populate("sender", "name avatar email role")
    .populate("receiver", "name avatar email role")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip));

  const total = await Message.countDocuments({ appointment: appointmentId });

  res.json({
    messages: messages.reverse(),
    total,
    hasMore: skip + limit < total
  });
});

// Send a message
exports.sendMessage = asyncWrap(async (req, res) => {
  const { appointmentId, receiverId, content, messageType = "text" } = req.body;
  const senderId = req.user._id;

  // Verify appointment exists
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  // Verify sender is part of appointment
  const isParticipant = appointment.doctor.equals(senderId) || appointment.patient.equals(senderId);
  if (!isParticipant) {
    return res.status(403).json({ message: "Unauthorized to send message" });
  }

  // Create message
  const message = new Message({
    appointment: appointmentId,
    sender: senderId,
    receiver: receiverId,
    content,
    messageType,
    attachments: req.files ? req.files.map(file => ({
      fileName: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      fileType: file.mimetype,
      fileSize: file.size
    })) : []
  });

  await message.save();
  await message.populate("sender", "name avatar email role");
  await message.populate("receiver", "name avatar email role");

  res.status(201).json(message);
});

// Mark message as read
exports.markAsRead = asyncWrap(async (req, res) => {
  const { messageId } = req.params;
  
  const message = await Message.findById(messageId);
  if (!message) {
    return res.status(404).json({ message: "Message not found" });
  }

  // Verify receiver
  if (!message.receiver.equals(req.user._id)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  await message.markAsRead();
  res.json(message);
});

// Mark all messages in appointment as read
exports.markChatAsRead = asyncWrap(async (req, res) => {
  const { appointmentId } = req.params;

  await Message.updateMany(
    {
      appointment: appointmentId,
      receiver: req.user._id,
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );

  res.json({ message: "Chat marked as read" });
});

// Get unread message count
exports.getUnreadCount = asyncWrap(async (req, res) => {
  const unreadCount = await Message.countDocuments({
    receiver: req.user._id,
    isRead: false
  });

  res.json({ unreadCount });
});

// Delete a message
exports.deleteMessage = asyncWrap(async (req, res) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);
  if (!message) {
    return res.status(404).json({ message: "Message not found" });
  }

  // Only sender or receiver can delete
  if (!message.sender.equals(req.user._id) && !message.receiver.equals(req.user._id)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  await Message.findByIdAndDelete(messageId);
  res.json({ message: "Message deleted" });
});
