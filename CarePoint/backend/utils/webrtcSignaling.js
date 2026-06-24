// backend/utils/webrtcSignaling.js
// WebRTC Signaling Server Logic using Socket.io

const activeVideoSessions = new Map(); // userId -> { socketId, peerId, status }

// Initialize WebRTC signaling
function initializeWebRTCSignaling(io) {
  io.on("connection", (socket) => {
    console.log("WebRTC user connected:", socket.id);

    // User initiates video call
    socket.on("video-call-initiate", (data) => {
      const { fromUserId, toUserId, fromUserName, toUserName } = data;

      console.log(`Video call from ${fromUserId} to ${toUserId}`);

      // Store session
      activeVideoSessions.set(fromUserId, {
        socketId: socket.id,
        peerId: toUserId,
        status: "calling",
        startTime: new Date(),
      });

      // Send call notification to recipient
      io.to(`user-${toUserId}`).emit("video-call-incoming", {
        fromUserId,
        fromUserName,
        toUserId,
        toUserName,
        callId: `${fromUserId}-${toUserId}-${Date.now()}`,
      });
    });

    // User accepts video call
    socket.on("video-call-accept", (data) => {
      const { fromUserId, toUserId } = data;

      console.log(`Video call accepted: ${toUserId} accepted from ${fromUserId}`);

      // Update session
      if (activeVideoSessions.has(fromUserId)) {
        activeVideoSessions.get(fromUserId).status = "active";
      }
      activeVideoSessions.set(toUserId, {
        socketId: socket.id,
        peerId: fromUserId,
        status: "active",
        startTime: new Date(),
      });

      // Notify caller that call was accepted
      io.to(`user-${fromUserId}`).emit("video-call-accepted", {
        fromUserId,
        toUserId,
      });
    });

    // Reject video call
    socket.on("video-call-reject", (data) => {
      const { fromUserId, toUserId } = data;

      console.log(`Video call rejected: ${toUserId} rejected from ${fromUserId}`);

      // Notify caller
      io.to(`user-${fromUserId}`).emit("video-call-rejected", {
        toUserId,
        reason: "User declined the call",
      });

      // Clean up session
      activeVideoSessions.delete(fromUserId);
      activeVideoSessions.delete(toUserId);
    });

    // WebRTC SDP Offer
    socket.on("video-sdp-offer", (data) => {
      const { fromUserId, toUserId, sdp } = data;

      io.to(`user-${toUserId}`).emit("video-sdp-offer", {
        fromUserId,
        sdp,
      });
    });

    // WebRTC SDP Answer
    socket.on("video-sdp-answer", (data) => {
      const { fromUserId, toUserId, sdp } = data;

      io.to(`user-${fromUserId}`).emit("video-sdp-answer", {
        toUserId,
        sdp,
      });
    });

    // WebRTC ICE Candidate
    socket.on("video-ice-candidate", (data) => {
      const { fromUserId, toUserId, candidate } = data;

      io.to(`user-${toUserId}`).emit("video-ice-candidate", {
        fromUserId,
        candidate,
      });
    });

    // End video call
    socket.on("video-call-end", (data) => {
      const { fromUserId, toUserId } = data;

      console.log(`Video call ended: ${fromUserId} ended call with ${toUserId}`);

      // Notify other user
      io.to(`user-${toUserId}`).emit("video-call-ended", {
        fromUserId,
      });

      // Clean up sessions
      activeVideoSessions.delete(fromUserId);
      activeVideoSessions.delete(toUserId);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("WebRTC user disconnected:", socket.id);

      // Find and end any active sessions
      for (const [userId, session] of activeVideoSessions.entries()) {
        if (session.socketId === socket.id) {
          const peerId = session.peerId;
          io.to(`user-${peerId}`).emit("video-call-ended", {
            reason: "User disconnected",
          });
          activeVideoSessions.delete(userId);
          activeVideoSessions.delete(peerId);
        }
      }
    });
  });
}

module.exports = { initializeWebRTCSignaling, activeVideoSessions };
