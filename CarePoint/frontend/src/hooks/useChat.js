import { useState, useCallback, useEffect, useRef } from "react";
import io from "socket.io-client";
import api from "../api/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useChat = () => {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize socket connection
  const initializeSocket = useCallback((userId) => {
    if (socketRef.current?.connected) return;

    socketRef.current = io(`${API_BASE_URL}/chat`, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      auth: {
        token: localStorage.getItem("authToken"),
      },
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to chat server");
    });

    // Listen for incoming messages
    socketRef.current.on("message-received", (message) => {
      setMessages((prev) => [...prev, message]);
      
      // Auto mark as read if I'm the receiver
      if (message.receiver._id === userId) {
        handleMessageRead(message._id);
      }
    });

    // Listen for typing indicators
    socketRef.current.on("user-typing", (data) => {
      setTypingUsers((prev) => new Set([...prev, data.userId]));
    });

    // Listen for stop typing
    socketRef.current.on("user-stopped-typing", (data) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    // Listen for read receipts
    socketRef.current.on("message-marked-read", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId ? { ...msg, isRead: true } : msg
        )
      );
    });

    // Listen for user joined/left
    socketRef.current.on("user-joined-chat", (data) => {
      console.log("User joined chat:", data.userId);
    });

    socketRef.current.on("user-left-chat", (data) => {
      console.log("User left chat:", data.userId);
    });

    socketRef.current.on("message-error", (data) => {
      setError(data.error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Join appointment chat room
  const joinAppointmentChat = useCallback((appointmentId, userId) => {
    if (!socketRef.current) {
      setError("Socket not initialized");
      return;
    }

    socketRef.current.emit("join-appointment-chat", {
      appointmentId,
      userId,
    });
  }, []);

  // Leave appointment chat room
  const leaveAppointmentChat = useCallback((appointmentId, userId) => {
    if (!socketRef.current) return;

    socketRef.current.emit("leave-appointment-chat", {
      appointmentId,
      userId,
    });
  }, []);

  // Load chat history
  const loadChatHistory = useCallback(async (appointmentId, limit = 50, skip = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(
        `/chat/history/${appointmentId}?limit=${limit}&skip=${skip}`
      );
      setMessages(response.data.messages);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load chat history");
      console.error("Error loading chat history:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(
    async (appointmentId, receiverId, content, files = []) => {
      try {
        setError(null);

        // Create FormData for file upload
        const formData = new FormData();
        formData.append("appointmentId", appointmentId);
        formData.append("receiverId", receiverId);
        formData.append("content", content);
        formData.append("messageType", files.length > 0 ? "report" : "text");

        // Add files
        files.forEach((file) => {
          formData.append("attachments", file);
        });

        // Send via REST API
        const response = await api.post("/chat/send", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Emit via socket for real-time delivery
        if (socketRef.current?.connected) {
          socketRef.current.emit("send-message", {
            appointmentId,
            senderId: response.data.sender._id,
            receiverId,
            content,
            messageType: response.data.messageType,
            attachments: response.data.attachments,
          });
        }

        return response.data;
      } catch (err) {
        const errorMsg = err.response?.data?.message || "Failed to send message";
        setError(errorMsg);
        throw err;
      }
    },
    []
  );

  // Handle typing indicator
  const emitTyping = useCallback((appointmentId, userId, userName) => {
    if (!socketRef.current?.connected) return;

    socketRef.current.emit("typing", {
      appointmentId,
      userId,
      userName,
    });
  }, []);

  // Handle stop typing
  const emitStopTyping = useCallback((appointmentId, userId) => {
    if (!socketRef.current?.connected) return;

    socketRef.current.emit("stop-typing", {
      appointmentId,
      userId,
    });
  }, []);

  // Mark message as read
  const handleMessageRead = useCallback(async (messageId) => {
    try {
      // Send via REST
      await api.patch(`/chat/read/${messageId}`);

      // Update local state
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, isRead: true, readAt: new Date() }
            : msg
        )
      );
    } catch (err) {
      console.error("Error marking message as read:", err);
    }
  }, []);

  // Mark all messages as read
  const markChatAsRead = useCallback(async (appointmentId) => {
    try {
      await api.patch(`/chat/read-all/${appointmentId}`);

      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          isRead: true,
          readAt: new Date(),
        }))
      );
    } catch (err) {
      console.error("Error marking chat as read:", err);
    }
  }, []);

  // Delete message
  const deleteMessage = useCallback(async (messageId) => {
    try {
      await api.delete(`/chat/${messageId}`);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete message");
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get("/chat/unread-count");
      setUnreadCount(response.data.unreadCount);
      return response.data.unreadCount;
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    typingUsers,
    unreadCount,
    initializeSocket,
    joinAppointmentChat,
    leaveAppointmentChat,
    loadChatHistory,
    sendMessage,
    emitTyping,
    emitStopTyping,
    handleMessageRead,
    markChatAsRead,
    deleteMessage,
    fetchUnreadCount,
  };
};
