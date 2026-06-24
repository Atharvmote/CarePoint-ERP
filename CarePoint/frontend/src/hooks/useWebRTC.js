// frontend/src/hooks/useWebRTC.js
import { useRef, useState, useEffect, useCallback } from "react";
import io from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useWebRTC = () => {
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  const [callStatus, setCallStatus] = useState("idle"); // idle, calling, ringing, active, ended
  const [callInfo, setCallInfo] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [error, setError] = useState(null);

  // ICE servers configuration
  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ],
  };

  // Initialize Socket.io connection
  const initializeSocket = useCallback((userId) => {
    if (socketRef.current) return;

    socketRef.current = io(API_BASE_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      auth: {
        token: localStorage.getItem("authToken"),
      },
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected for WebRTC");
      socketRef.current.emit("user-online", userId);
    });

    // Incoming call notification
    socketRef.current.on("video-call-incoming", (data) => {
      console.log("Incoming video call:", data);
      setCallStatus("ringing");
      setCallInfo(data);
    });

    // Call accepted
    socketRef.current.on("video-call-accepted", async (data) => {
      console.log("Call accepted:", data);
      setCallStatus("active");
      await createOffer(data.toUserId);
    });

    // Call rejected
    socketRef.current.on("video-call-rejected", (data) => {
      console.log("Call rejected:", data);
      setCallStatus("ended");
      setError(data.reason || "Call rejected");
      endCall();
    });

    // Receive SDP Offer
    socketRef.current.on("video-sdp-offer", async (data) => {
      console.log("Received SDP offer:", data);
      await handleRemoteOffer(data.sdp);
      await sendAnswer(data.fromUserId);
    });

    // Receive SDP Answer
    socketRef.current.on("video-sdp-answer", async (data) => {
      console.log("Received SDP answer:", data);
      await handleRemoteAnswer(data.sdp);
    });

    // Receive ICE Candidate
    socketRef.current.on("video-ice-candidate", async (data) => {
      console.log("Received ICE candidate:", data);
      if (data.candidate) {
        try {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    });

    // Call ended
    socketRef.current.on("video-call-ended", (data) => {
      console.log("Call ended:", data);
      setCallStatus("ended");
      endCall();
    });
  }, []);

  // Get local media stream
  const getLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setError("Unable to access camera/microphone. Please check permissions.");
      throw err;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback(async () => {
    try {
      peerConnectionRef.current = new RTCPeerConnection({ iceServers });

      // Add local stream tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          peerConnectionRef.current.addTrack(track, localStreamRef.current);
        });
      }

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        console.log("Received remote track:", event.track);
        remoteStreamRef.current = event.streams[0];
        setRemoteStream(event.streams[0]);
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate && socketRef.current && callInfo) {
          socketRef.current.emit("video-ice-candidate", {
            fromUserId: callInfo.fromUserId || callInfo.toUserId,
            toUserId: callInfo.toUserId || callInfo.fromUserId,
            candidate: event.candidate,
          });
        }
      };

      // Handle connection state changes
      peerConnectionRef.current.onconnectionstatechange = () => {
        console.log(
          "Connection state:",
          peerConnectionRef.current.connectionState
        );
        if (peerConnectionRef.current.connectionState === "failed") {
          setError("Connection failed. Please try again.");
        }
      };
    } catch (err) {
      console.error("Error creating peer connection:", err);
      setError("Failed to create peer connection");
      throw err;
    }
  }, [callInfo]);

  // Create and send SDP offer
  const createOffer = useCallback(
    async (toUserId) => {
      try {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);

        socketRef.current.emit("video-sdp-offer", {
          fromUserId: callInfo.fromUserId,
          toUserId: toUserId,
          sdp: offer,
        });
      } catch (err) {
        console.error("Error creating offer:", err);
        setError("Failed to create offer");
      }
    },
    [callInfo]
  );

  // Handle remote SDP offer
  const handleRemoteOffer = useCallback(async (offer) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
    } catch (err) {
      console.error("Error handling remote offer:", err);
      setError("Failed to process incoming offer");
    }
  }, []);

  // Create and send SDP answer
  const sendAnswer = useCallback(
    async (toUserId) => {
      try {
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);

        socketRef.current.emit("video-sdp-answer", {
          fromUserId: callInfo.fromUserId || callInfo.toUserId,
          toUserId: toUserId,
          sdp: answer,
        });
      } catch (err) {
        console.error("Error creating answer:", err);
        setError("Failed to create answer");
      }
    },
    [callInfo]
  );

  // Handle remote SDP answer
  const handleRemoteAnswer = useCallback(async (answer) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    } catch (err) {
      console.error("Error handling remote answer:", err);
      setError("Failed to process answer");
    }
  }, []);

  // Initiate video call
  const initiateCall = useCallback(
    async (toUserId, toUserName, fromUserId, fromUserName) => {
      try {
        setError(null);
        setCallStatus("calling");
        setCallInfo({
          fromUserId,
          toUserId,
          fromUserName,
          toUserName,
        });

        // Get local stream
        await getLocalStream();

        // Create peer connection
        await createPeerConnection();

        // Notify recipient
        socketRef.current.emit("video-call-initiate", {
          fromUserId,
          toUserId,
          fromUserName,
          toUserName,
        });
      } catch (err) {
        console.error("Error initiating call:", err);
        setCallStatus("idle");
      }
    },
    [getLocalStream, createPeerConnection]
  );

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    try {
      setError(null);
      setCallStatus("connecting");

      // Get local stream
      await getLocalStream();

      // Create peer connection
      await createPeerConnection();

      // Accept call via socket
      socketRef.current.emit("video-call-accept", {
        fromUserId: callInfo.fromUserId,
        toUserId: callInfo.toUserId,
      });
    } catch (err) {
      console.error("Error accepting call:", err);
      setCallStatus("ended");
    }
  }, [callInfo, getLocalStream, createPeerConnection]);

  // Reject incoming call
  const rejectCall = useCallback(() => {
    socketRef.current.emit("video-call-reject", {
      fromUserId: callInfo.fromUserId,
      toUserId: callInfo.toUserId,
    });
    setCallStatus("idle");
    setCallInfo(null);
  }, [callInfo]);

  // End call
  const endCall = useCallback(() => {
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    // Clear remote stream
    remoteStreamRef.current = null;
    setRemoteStream(null);

    // Notify other user
    if (callInfo && socketRef.current) {
      socketRef.current.emit("video-call-end", {
        fromUserId: callInfo.fromUserId,
        toUserId: callInfo.toUserId,
      });
    }

    setCallStatus("idle");
    setCallInfo(null);
  }, [callInfo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    // State
    callStatus,
    callInfo,
    localStream,
    remoteStream,
    error,

    // Methods
    initializeSocket,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    getLocalStream,
  };
};
