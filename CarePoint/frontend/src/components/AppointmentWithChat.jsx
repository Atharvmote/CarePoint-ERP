import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ChatPanel from "./ChatPanel";
import AppointmentVideoCall from "./AppointmentVideoCall";
import { MessageCircle } from "lucide-react";
import "./AppointmentWithChat.css";

/**
 * Integrated component for appointment with chat and video call
 * Shows chat automatically when appointment is in-progress
 */
export default function AppointmentWithChat({ appointment }) {
  const { user } = useAuth();
  const [showChat, setShowChat] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Auto-show chat if appointment is in-progress
  useEffect(() => {
    if (appointment?.status === "in-progress") {
      setShowChat(true);
    }
  }, [appointment?.status]);

  const isDoctor = user?._id === appointment?.doctor?._id;
  const isPatient = user?._id === appointment?.patient?._id;
  const doctorName = appointment?.doctor?.name || "Doctor";
  const patientName = appointment?.patient?.name || "Patient";

  return (
    <div className="appointment-with-chat">
      {/* Appointment Info Section */}
      <div className="appointment-info-section">
        <div className="appointment-header">
          <h2 className="appointment-title">Appointment Details</h2>
          <span className={`status-badge ${appointment?.status}`}>
            {appointment?.status?.toUpperCase()}
          </span>
        </div>

        <div className="appointment-details">
          <div className="detail-row">
            <label>Doctor:</label>
            <span>{doctorName}</span>
          </div>
          <div className="detail-row">
            <label>Patient:</label>
            <span>{patientName}</span>
          </div>
          <div className="detail-row">
            <label>Date:</label>
            <span>{appointment?.date}</span>
          </div>
          <div className="detail-row">
            <label>Time:</label>
            <span>{appointment?.time}</span>
          </div>
          {appointment?.reason && (
            <div className="detail-row">
              <label>Reason:</label>
              <span>{appointment.reason}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="appointment-actions">
          {appointment?.status === "in-progress" && (
            <>
              <button
                onClick={() => setShowChat(!showChat)}
                className="action-btn chat-btn"
              >
                <MessageCircle className="w-4 h-4" />
                {showChat ? "Hide Chat" : "Open Chat"}
              </button>

              {isDoctor && (
                <button
                  onClick={() => setShowVideo(!showVideo)}
                  className="action-btn video-btn"
                >
                  📹 {showVideo ? "Hide Video" : "Start Video Call"}
                </button>
              )}

              {isPatient && (
                <button
                  onClick={() => setShowVideo(!showVideo)}
                  className="action-btn video-btn"
                >
                  📹 {showVideo ? "Hide Video" : "Join Video Call"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Video Call Section */}
      {showVideo && appointment?.status === "in-progress" && (
        <div className="video-section">
          <AppointmentVideoCall
            appointment={appointment}
            doctorId={isPatient ? appointment.doctor._id : appointment.patient._id}
          />
        </div>
      )}

      {/* Chat Section */}
      {showChat && (
        <div className="chat-section">
          <ChatPanel
            appointment={appointment}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}
    </div>
  );
}
