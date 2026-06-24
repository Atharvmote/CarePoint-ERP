// frontend/src/components/DoctorStatusToggle.jsx
import { useState, useEffect, useRef } from "react";
import { Power } from "lucide-react";
import api from "../api/api.js";
import { toast } from "react-toastify";
import io from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Component for doctor to toggle online/offline status
 * Broadcasts status change to all connected patients via Socket.io
 * Usage: <DoctorStatusToggle userId={user._id} />
 */
export default function DoctorStatusToggle({ userId }) {
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [workHours, setWorkHours] = useState("00:00:00");
  const socketRef = useRef(null);

  // Initialize Socket.io connection
  useEffect(() => {
    socketRef.current = io(API_BASE_URL, {
      auth: {
        token: localStorage.getItem("authToken"),
      },
    });

    socketRef.current.on("connect", () => {
      console.log("Doctor connected to real-time updates");
      socketRef.current.emit("user-online", userId);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId]);

  // Get current doctor status on mount
  useEffect(() => {
    fetchDoctorStatus();
  }, []);

  // Update work hours display
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      fetchDoctorStatus();
    }, 1000);

    return () => clearInterval(interval);
  }, [isOnline]);

  const fetchDoctorStatus = async () => {
    try {
      const response = await api.getMyDoctorProfile();
      setIsOnline(response.status === "online");

      // Calculate work hours
      if (response.workSecondsToday) {
        const hours = Math.floor(response.workSecondsToday / 3600);
        const minutes = Math.floor((response.workSecondsToday % 3600) / 60);
        const seconds = response.workSecondsToday % 60;
        setWorkHours(
          `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0"
          )}:${String(seconds).padStart(2, "0")}`
        );
      }
    } catch (error) {
      console.error("Error fetching doctor status:", error);
    }
  };

  const handleStatusToggle = async () => {
    setLoading(true);
    try {
      if (isOnline) {
        // End work
        const response = await api.endWork();
        setIsOnline(false);
        toast.success("You are now offline ✅");

        // 🔄 Broadcast status change
        if (socketRef.current) {
          socketRef.current.emit("doctor-status-changed", {
            doctorId: userId,
            status: "offline",
            timestamp: new Date(),
          });
        }
      } else {
        // Start work
        const response = await api.startWork();
        setIsOnline(true);
        toast.success("You are now online ✅");

        // 🔄 Broadcast status change
        if (socketRef.current) {
          socketRef.current.emit("doctor-status-changed", {
            doctorId: userId,
            status: "online",
            timestamp: new Date(),
          });
        }
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
      {/* Status Indicator */}
      <div className="flex items-center gap-3">
        <div
          className={`w-4 h-4 rounded-full ${
            isOnline ? "bg-green-500" : "bg-gray-400"
          } animate-pulse`}
        ></div>
        <div>
          <p className="text-sm font-semibold text-slate-700">
            {isOnline ? "Online" : "Offline"}
          </p>
          <p className="text-xs text-slate-500">Work hours: {workHours}</p>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={handleStatusToggle}
        disabled={loading}
        className={`ml-auto px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
          isOnline
            ? "bg-red-100 text-red-600 hover:bg-red-200"
            : "bg-green-100 text-green-600 hover:bg-green-200"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Power className="w-4 h-4" />
        {loading ? "Updating..." : isOnline ? "Go Offline" : "Go Online"}
      </button>
    </div>
  );
}
