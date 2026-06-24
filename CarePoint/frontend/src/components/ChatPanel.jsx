import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, X, Download, Eye } from "lucide-react";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../context/AuthContext";
import "./ChatPanel.css";

export default function ChatPanel({ appointment, onClose }) {
  const { user } = useAuth();
  const {
    messages,
    isLoading,
    error,
    typingUsers,
    initializeSocket,
    joinAppointmentChat,
    leaveAppointmentChat,
    loadChatHistory,
    sendMessage,
    emitTyping,
    emitStopTyping,
    markChatAsRead,
  } = useChat();

  const [messageContent, setMessageContent] = useState("");
  const [files, setFiles] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Handle appointment ID - could be _id or id
  const appointmentId = appointment?._id || appointment?.id;
  
  // Determine receiver ID based on user role
  const receiverId = user._id === appointment?.doctor?._id 
    ? appointment?.patient?._id 
    : appointment?.doctor?._id;
  
  const recipientName = user._id === appointment?.doctor?._id 
    ? appointment?.patient?.user?.name || appointment?.patient?.name || "Patient"
    : appointment?.doctor?.user?.name || appointment?.doctor?.name || "Doctor";

  // Initialize socket and load chat history
  useEffect(() => {
    if (user?._id) {
      initializeSocket(user._id);
      loadChatHistory(appointmentId);
      joinAppointmentChat(appointmentId, user._id);
    }

    return () => {
      if (appointmentId && user?._id) {
        leaveAppointmentChat(appointmentId, user._id);
      }
    };
  }, [appointmentId, user, initializeSocket, loadChatHistory, joinAppointmentChat, leaveAppointmentChat]);

  // Mark chat as read when component mounts
  useEffect(() => {
    markChatAsRead(appointmentId);
  }, [appointmentId, markChatAsRead]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle typing
  const handleMessageChange = (e) => {
    setMessageContent(e.target.value);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing event
    emitTyping(appointmentId, user._id, user.name);

    // Emit stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(appointmentId, user._id);
    }, 3000);
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
    e.target.value = null;
  };

  // Remove file
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Send message
  const handleSendMessage = async () => {
    if (!messageContent.trim() && files.length === 0) return;

    setIsSending(true);
    try {
      await sendMessage(appointmentId, receiverId, messageContent, files);
      setMessageContent("");
      setFiles([]);
      emitStopTyping(appointmentId, user._id);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsSending(false);
    }
  };

  // Handle enter key to send
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("document") || fileType.includes("word")) return "📝";
    if (fileType.includes("sheet") || fileType.includes("excel")) return "📊";
    return "📎";
  };

  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="chat-header">
        <div>
          <h3 className="chat-title">Chat with {recipientName}</h3>
          <p className="chat-appointment-info">Appointment • {appointment?.date || "Date TBD"} at {appointment?.time || "Time TBD"}</p>
          {user._id === appointment?.patient?._id && (
            <p className="text-xs text-blue-600 mt-1 font-semibold">💡 Tip: You can upload medical reports, test results, or documents using the Attach button</p>
          )}
        </div>
        <button onClick={onClose} className="chat-close-btn" title="Close chat">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="chat-messages">
        {isLoading && (
          <div className="chat-loading">
            <div className="spinner"></div>
            <p>Loading chat history...</p>
          </div>
        )}

        {error && (
          <div className="chat-error">
            <p>{error}</p>
          </div>
        )}

        {messages.length === 0 && !isLoading && (
          <div className="chat-empty">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat-message ${
              message.sender._id === user._id ? "sent" : "received"
            }`}
          >
            <div className="message-content-wrapper">
              <div className="message-header">
                <span className="message-sender">{message.sender.name}</span>
                <span className="message-time">{formatTime(message.createdAt)}</span>
              </div>

              {message.content && (
                <p className="message-text">{message.content}</p>
              )}

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="message-attachments">
                  {message.attachments.map((attachment, idx) => (
                    <div key={idx} className="attachment-item">
                      <div className="attachment-info">
                        <span className="attachment-icon">
                          {getFileIcon(attachment.fileType)}
                        </span>
                        <div className="attachment-details">
                          <p className="attachment-name" title={attachment.fileName}>
                            {attachment.fileName}
                          </p>
                          <span className="attachment-size">
                            {formatFileSize(attachment.fileSize)}
                          </span>
                        </div>
                      </div>
                      <div className="attachment-actions">
                        <a
                          href={attachment.fileUrl}
                          download={attachment.fileName}
                          className="attachment-btn download-btn"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          className="attachment-btn preview-btn"
                          onClick={() => setShowFilePreview(attachment)}
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Read receipt */}
              {message.sender._id === user._id && message.isRead && (
                <span className="read-receipt" title={`Read at ${formatTime(message.readAt)}`}>
                  ✓✓
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typingUsers.size > 0 && (
          <div className="chat-message received typing-indicator">
            <div className="typing-animation">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        {/* File preview */}
        {files.length > 0 && (
          <div className="selected-files">
            {files.map((file, idx) => (
              <div key={idx} className="selected-file">
                <span className="file-name">{file.name}</span>
                <button
                  onClick={() => removeFile(idx)}
                  className="remove-file-btn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input controls */}
        <div className="input-controls">
          <textarea
            value={messageContent}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message... (Shift+Enter for new line)"
            className="message-input"
            rows="3"
            disabled={isSending}
          />

          <div className="input-buttons">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="file-button"
              disabled={isSending}
              title="Attach files (reports, documents, images)"
            >
              <Paperclip className="w-5 h-5" />
              <span className="ml-1">Attach</span>
            </button>

            <button
              onClick={handleSendMessage}
              disabled={isSending || (!messageContent.trim() && files.length === 0)}
              className="send-button"
              title="Send message"
            >
              <Send className="w-5 h-5" />
              <span className="ml-1">Send</span>
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden-file-input"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
        />

        <p className="file-hint">Max 5 files, 10MB each. Allowed: PDF, DOC, XLS, Images</p>
      </div>

      {/* File Preview Modal */}
      {showFilePreview && (
        <div className="preview-modal" onClick={() => setShowFilePreview(null)}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowFilePreview(null)}
              className="preview-close"
            >
              <X className="w-6 h-6" />
            </button>

            {showFilePreview.fileType.includes("image") ? (
              <img src={showFilePreview.fileUrl} alt="Preview" />
            ) : (
              <div className="preview-placeholder">
                <p>{getFileIcon(showFilePreview.fileType)}</p>
                <p className="preview-filename">{showFilePreview.fileName}</p>
                <p className="preview-size">
                  {formatFileSize(showFilePreview.fileSize)}
                </p>
                <a
                  href={showFilePreview.fileUrl}
                  download={showFilePreview.fileName}
                  className="preview-download-btn"
                >
                  Download File
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
