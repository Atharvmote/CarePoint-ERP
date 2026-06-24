import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import "./AppointmentStartedNotification.css";

/**
 * Toast-style notification that appears when appointment starts
 * Prompts user to open chat
 */
export default function AppointmentStartedNotification({
  notification,
  onOpenChat,
  onDismiss,
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-hide after 8 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 8000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!isVisible || !notification) return null;

  const appointment = notification.appointment;

  return (
    <div className="appointment-started-toast">
      <div className="toast-content">
        <div className="toast-icon">
          <Bell className="w-6 h-6" />
        </div>

        <div className="toast-message">
          <h4 className="toast-title">{notification.title}</h4>
          <p className="toast-text">{notification.message}</p>
          {appointment && (
            <p className="toast-details">
              {appointment.date} at {appointment.time}
            </p>
          )}
        </div>

        <div className="toast-actions">
          <button
            onClick={() => {
              onOpenChat?.(appointment);
              setIsVisible(false);
            }}
            className="toast-btn action-btn"
          >
            Open Chat
          </button>
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss?.();
            }}
            className="toast-btn dismiss-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
