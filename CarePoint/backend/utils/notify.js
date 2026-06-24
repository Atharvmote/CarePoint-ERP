const User = require("../models/User");
const Notification = require("../models/Notification");

exports.notifyUser = async (req, userId, type, title, message, relatedId = null) => {
  try {
    if (!userId) return;
    
    const notification = await Notification.create({
      recipient: userId,
      type,
      title,
      message,
      relatedId
    });

    if (req.io) {
      req.io.to(`user-${userId}`).emit(type, {
        id: notification._id,
        type,
        title,
        message,
        timestamp: notification.createdAt,
        relatedId
      });
    }
    return notification;
  } catch (err) {
    console.error("Notify User Error:", err.message);
  }
};

exports.notifyAdmins = async (req, type, title, message, relatedId = null) => {
  try {
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await exports.notifyUser(req, admin._id, type, title, message, relatedId);
    }
  } catch (err) {
    console.error("Notify Admins Error:", err.message);
  }
};
