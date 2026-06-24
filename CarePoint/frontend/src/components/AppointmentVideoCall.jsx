// frontend/src/components/AppointmentVideoCall.jsx
import { useState, useEffect } from "react";
import { Phone, Video } from "lucide-react";
import VideoCallModal from "./modals/VideoCallModal";
import { useWebRTC } from "../hooks/useWebRTC";
import { useAuth } from "../context/AuthContext";

/**
 * Component to add video call button to appointment details
 * Usage: <AppointmentVideoCall appointment={appointment} />
 */
export default function AppointmentVideoCall({ appointment, doctorId }) {
  const { user } = useAuth();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const { initializeSocket, initiateCall, callStatus } = useWebRTC();

  // Initialize socket when component mounts
  useEffect(() => {
    if (user?._id) {
      initializeSocket(user._id);
    }
  }, [user, initializeSocket]);

  const handleVideoCall = async () => {
    try {
      // Start the call
      await initiateCall(
        doctorId,
        appointment?.doctorName || "Doctor",
        user._id,
        user?.name || "Patient"
      );
      setShowVideoModal(true);
    } catch (err) {
      console.error("Error starting video call:", err);
      alert("Failed to start video call. Please try again.");
    }
  };

  return (
    <>
      {/* Video Call Button */}
      <button
        onClick={handleVideoCall}
        disabled={callStatus !== "idle"}
        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Video className="w-5 h-5" />
        {callStatus === "idle" ? "Start Video Call" : "Call in Progress..."}
      </button>

      {/* Video Call Modal */}
      <VideoCallModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        appointment={appointment}
      />
    </>
  );
}
