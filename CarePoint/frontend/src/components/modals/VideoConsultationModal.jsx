import React from 'react';
import { X } from 'lucide-react';

function VideoConsultationModal({ appointmentId, userName, onClose }) {
  // Generate a unique, unguessable room name using the database ID
  const roomName = `CarePoint-Consult-${appointmentId}`;
  
  // Reverted to official meet.jit.si because it definitively allows iframes
  const jitsiUrl = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false`;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col backdrop-blur-sm shadow-2xl transition-all">
      
      {/* Header Bar */}
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-700/50 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <h2 className="text-white font-semibold text-lg">Telemedicine Consultation</h2>
          <span className="ml-3 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-mono">
            {roomName}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.open(`https://meet.ffmuc.net/${roomName}`, '_blank')}
            className="text-slate-300 hover:text-white text-sm font-medium underline underline-offset-4"
          >
            Having trouble? Open in new tab
          </button>
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-colors font-medium text-sm border border-red-500/20"
          >
            <X className="w-4 h-4" />
            End Consultation
          </button>
        </div>
      </div>

      {/* Video Iframe Container */}
      <div className="flex-1 w-full h-full bg-black relative">
        <iframe
          src={jitsiUrl}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="absolute inset-0 w-full h-full border-none"
          title="Video Consultation"
        ></iframe>
      </div>
    </div>
  );
}

export default VideoConsultationModal;
