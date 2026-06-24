// frontend/src/components/Doctor/AppointmentDoctorStatus.jsx
import { useEffect, useState, useRef } from "react";
import { Clock, AlertCircle, Check } from "lucide-react";
import io from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Component to show real-time doctor status for an appointment
 * Updates instantly when doctor goes online/offline (no refresh needed!)
 * 
 * Usage: <AppointmentDoctorStatus doctorId={doctorId} />
 */
export default function AppointmentDoctorStatus({ doctorId, doctorName = "Doctor" }) {
  const [doctorStatus, setDoctorStatus] = useState("unknown");
  const [lastUpdated, setLastUpdated] = useState(null);
  const socketRef = useRef(null);

  // Connect to Socket.io for real-time updates
  useEffect(() => {
    socketRef.current = io(API_BASE_URL, {
      auth: {
        token: localStorage.getItem("authToken"),
      },
    });

    // Listen for doctor status changes
    socketRef.current.on("doctor-status-changed", (data) => {
      if (data.doctorId === doctorId) {
        setDoctorStatus(data.status);
        setLastUpdated(new Date());
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [doctorId]);

  // Status styling
  const getStatusStyles = () => {
    switch (doctorStatus) {
      case "online":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          indicator: "bg-green-500",
          text: "text-green-700",
          label: "Online - Ready for consultation",
        };
      case "offline":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          indicator: "bg-red-500",
          text: "text-red-700",
          label: "Offline - Not available",
        };
      case "busy":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          indicator: "bg-yellow-500",
          text: "text-yellow-700",
          label: "Busy - With another patient",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          indicator: "bg-gray-400",
          text: "text-gray-700",
          label: "Status unknown",
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div
      className={`p-4 rounded-lg border-2 ${styles.bg} ${styles.border} transition-all`}
    >
      <div className="flex items-center gap-3">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${styles.indicator} animate-pulse`}
          ></div>
          <div>
            <p className={`text-sm font-semibold ${styles.text}`}>
              {doctorName}
            </p>
            <p className={`text-xs ${styles.text} opacity-75`}>
              {styles.label}
            </p>
          </div>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className={`ml-auto flex items-center gap-1 ${styles.text} text-xs`}>
            <Clock className="w-3 h-3" />
            <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Action Suggestion */}
      <div className="mt-3 text-xs text-slate-600 flex items-center gap-2">
        {doctorStatus === "online" ? (
          <>
            <Check className="w-4 h-4 text-green-500" />
            <span>You can join the video call now!</span>
          </>
        ) : doctorStatus === "offline" ? (
          <>
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span>Doctor is offline. Please wait for them to come online.</span>
          </>
        ) : null}
      </div>
    </div>
  );
}
