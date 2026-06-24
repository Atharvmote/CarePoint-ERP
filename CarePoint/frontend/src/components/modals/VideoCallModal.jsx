// frontend/src/components/modals/VideoCallModal.jsx
import { useEffect, useRef, useState } from "react";
import { X, Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useWebRTC } from "../../hooks/useWebRTC";

export default function VideoCallModal({ isOpen, onClose, appointment }) {
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const {
    callStatus,
    localStream,
    remoteStream,
    error,
    acceptCall,
    rejectCall,
    endCall,
  } = useWebRTC();

  // Display local video
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Display remote video
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!isOpen) return null;

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMicOn(!isMicOn);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent p-4 flex justify-between items-center">
        <div>
          <h3 className="text-white font-bold text-lg">Video Call</h3>
          <p className="text-gray-300 text-sm">
            {callStatus === "calling" && "Calling..."}
            {callStatus === "ringing" && "Incoming call..."}
            {callStatus === "active" && "Connected"}
            {callStatus === "connecting" && "Connecting..."}
          </p>
        </div>
        {callStatus === "idle" && (
          <button
            onClick={onClose}
            className="text-white hover:bg-red-600 p-2 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Video Container */}
      <div className="w-full h-full flex items-center justify-center relative">
        {/* Remote Video (Large) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Local Video (Small - Picture in Picture) */}
        {localStream && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-20 right-4 w-32 h-32 md:w-48 md:h-48 border-4 border-white rounded-lg object-cover shadow-lg"
          />
        )}

        {/* Call Status Messages */}
        {callStatus === "ringing" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white">
              <div className="mb-4 animate-pulse">
                <Phone className="w-16 h-16 mx-auto mb-4" />
                <p className="text-2xl font-bold mb-4">Incoming Call</p>
                <p className="text-lg mb-8">{appointment?.doctorName}</p>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={acceptCall}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full flex items-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Accept
                </button>
                <button
                  onClick={rejectCall}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full flex items-center gap-2"
                >
                  <PhoneOff className="w-5 h-5" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {callStatus === "calling" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white">
              <div className="mb-4 animate-pulse">
                <Phone className="w-16 h-16 mx-auto mb-4 animate-bounce" />
                <p className="text-2xl font-bold">Calling...</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Controls */}
      {(callStatus === "active" || callStatus === "connecting") && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <div className="flex justify-center gap-4">
            {/* Microphone Toggle */}
            <button
              onClick={toggleMic}
              className={`p-4 rounded-full transition-all ${
                isMicOn
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-red-600 hover:bg-red-700"
              } text-white`}
            >
              {isMicOn ? (
                <Mic className="w-6 h-6" />
              ) : (
                <MicOff className="w-6 h-6" />
              )}
            </button>

            {/* Video Toggle */}
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-all ${
                isVideoOn
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-red-600 hover:bg-red-700"
              } text-white`}
            >
              {isVideoOn ? (
                <Video className="w-6 h-6" />
              ) : (
                <VideoOff className="w-6 h-6" />
              )}
            </button>

            {/* End Call */}
            <button
              onClick={() => {
                endCall();
                onClose();
              }}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
