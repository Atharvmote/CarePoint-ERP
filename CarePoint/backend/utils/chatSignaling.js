const Message = require("../models/Message");

/**
 * Initialize Chat Socket Events
 * Handles real-time chat messages, typing indicators, and read receipts
 */
function initializeChatSignaling(io) {
  // Chat namespace for better organization
  const chatNamespace = io.of("/chat");

  chatNamespace.on("connection", (socket) => {
    console.log("User connected to chat:", socket.id);

    /**
     * Join appointment chat room
     * Format: 'appointment-{appointmentId}'
     */
    socket.on("join-appointment-chat", (data) => {
      const { appointmentId, userId } = data;
      const roomName = `appointment-${appointmentId}`;
      
      socket.join(roomName);
      console.log(`User ${userId} joined chat room: ${roomName}`);

      // Notify others that user is online
      socket.to(roomName).emit("user-joined-chat", {
        userId,
        timestamp: new Date()
      });
    });

    /**
     * Handle incoming chat message
     */
    socket.on("send-message", async (data) => {
      try {
        const { appointmentId, senderId, receiverId, content, messageType, attachments } = data;
        const roomName = `appointment-${appointmentId}`;

        // Save message to database
        const message = new Message({
          appointment: appointmentId,
          sender: senderId,
          receiver: receiverId,
          content,
          messageType: messageType || "text",
          attachments: attachments || []
        });

        const savedMessage = await message.save();
        await savedMessage.populate("sender", "name avatar email role");
        await savedMessage.populate("receiver", "name avatar email role");

        // Broadcast message to room
        io.to(roomName).emit("message-received", savedMessage);
        console.log(`Message sent in ${roomName}:`, savedMessage._id);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("message-error", { error: error.message });
      }
    });

    /**
     * Handle typing indicator
     */
    socket.on("typing", (data) => {
      const { appointmentId, userId, userName } = data;
      const roomName = `appointment-${appointmentId}`;

      socket.to(roomName).emit("user-typing", {
        userId,
        userName
      });
    });

    /**
     * Handle stop typing
     */
    socket.on("stop-typing", (data) => {
      const { appointmentId, userId } = data;
      const roomName = `appointment-${appointmentId}`;

      socket.to(roomName).emit("user-stopped-typing", {
        userId
      });
    });

    /**
     * Mark message as read
     */
    socket.on("message-read", async (data) => {
      try {
        const { messageId, appointmentId } = data;
        const roomName = `appointment-${appointmentId}`;

        await Message.findByIdAndUpdate(messageId, {
          isRead: true,
          readAt: new Date()
        });

        io.to(roomName).emit("message-marked-read", { messageId });
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    });

    /**
     * Leave appointment chat room
     */
    socket.on("leave-appointment-chat", (data) => {
      const { appointmentId, userId } = data;
      const roomName = `appointment-${appointmentId}`;

      socket.leave(roomName);
      socket.to(roomName).emit("user-left-chat", {
        userId,
        timestamp: new Date()
      });

      console.log(`User ${userId} left chat room: ${roomName}`);
    });

    /**
     * Handle disconnect
     */
    socket.on("disconnect", () => {
      console.log("User disconnected from chat:", socket.id);
    });
  });

  return chatNamespace;
}

module.exports = { initializeChatSignaling };
