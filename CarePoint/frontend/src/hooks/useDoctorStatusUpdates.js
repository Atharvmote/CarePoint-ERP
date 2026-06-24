// frontend/src/hooks/useDoctorStatusUpdates.js
import { useEffect, useCallback, useRef } from "react";
import io from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Hook to listen for real-time doctor status updates via Socket.io
 * Updates doctor list in real-time when doctor goes online/offline/busy
 */
export const useDoctorStatusUpdates = (doctors, setDoctors, userId) => {
  useEffect(() => {
    if (!doctors || !setDoctors || !userId) return;

    // Create socket connection
    const socket = io(API_BASE_URL, {
      auth: {
        token: localStorage.getItem("authToken"),
      },
    });

    socket.on("connect", () => {
      console.log("Connected to real-time status updates");
      // Emit that user is online for notifications
      socket.emit("user-online", userId);
    });

    // 🔄 Listen for doctor status changes
    socket.on("doctor-status-changed", (data) => {
      console.log("Doctor status changed:", data);

      setDoctors((prevDoctors) => {
        // Update the doctor's status in the list
        return prevDoctors.map((doctor) => {
          if (doctor._id === data.doctorId) {
            return {
              ...doctor,
              status: data.status,
              lastStatusUpdate: data.timestamp,
            };
          }
          return doctor;
        });
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Disconnected from real-time updates");
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [doctors, setDoctors, userId]);
};

/**
 * Hook to emit doctor status change (for doctor's own status updates)
 */
export const useDoctorStatusEmitter = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(API_BASE_URL, {
      auth: {
        token: localStorage.getItem("authToken"),
      },
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const emitStatusChange = useCallback((doctorId, status) => {
    if (socketRef.current) {
      socketRef.current.emit("doctor-status-changed", {
        doctorId,
        status,
        timestamp: new Date(),
      });
    }
  }, []);

  return { emitStatusChange };
};
