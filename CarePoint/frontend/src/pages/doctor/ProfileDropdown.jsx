import { useState, useEffect, useRef } from 'react';
import { User, LogOut, Clock, Play, Square } from 'lucide-react';
import api from '../../api/api';

function ProfileDropdown({ doctorName, doctorRole, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [workStartTime, setWorkStartTime] = useState(null);
  const [workSecondsToday, setWorkSecondsToday] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const dropdownRef = useRef(null);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const updateElapsed = (baseSeconds, startTime) => {
    if (startTime) {
      const now = new Date();
      const currentDiff = Math.floor((now - new Date(startTime)) / 1000);
      return baseSeconds + currentDiff;
    }
    return baseSeconds;
  };

  useEffect(() => {
    const fetchDoctorStatus = async () => {
      try {
        const doctor = await api.getMyDoctorProfile();
        const working = doctor.status === 'online';
        setIsWorking(working);
        setWorkSecondsToday(doctor.workSecondsToday || 0);
        setWorkStartTime(doctor.currentShiftStart ? new Date(doctor.currentShiftStart) : null);
        setElapsedTime(
          updateElapsed(doctor.workSecondsToday || 0, doctor.currentShiftStart)
        );
      } catch (err) {
        console.error('Doctor status error', err);
      }
    };

    fetchDoctorStatus();
  }, []);

  useEffect(() => {
    let interval;
    if (isWorking && workStartTime) {
      interval = setInterval(() => {
        setElapsedTime(updateElapsed(workSecondsToday, workStartTime));
      }, 1000);
    } else {
      setElapsedTime(workSecondsToday);
    }
    return () => clearInterval(interval);
  }, [isWorking, workStartTime, workSecondsToday]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartWork = async () => {
    try {
      const doctor = await api.startWork();
      setIsWorking(true);
      setWorkSecondsToday(doctor.workSecondsToday || 0);
      setWorkStartTime(doctor.currentShiftStart ? new Date(doctor.currentShiftStart) : new Date());
      setElapsedTime(updateElapsed(doctor.workSecondsToday || 0, doctor.currentShiftStart));
    } catch (err) {
      console.error('Start work failed', err);
    }
  };

  const handleStopWork = async () => {
    try {
      const doctor = await api.endWork();
      setIsWorking(false);
      setWorkStartTime(null);
      setWorkSecondsToday(doctor.workSecondsToday || 0);
      setElapsedTime(doctor.workSecondsToday || 0);
    } catch (err) {
      console.error('End work failed', err);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-800">{doctorName}</p>
          <p className="text-xs text-slate-500">{doctorRole}</p>
        </div>
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
            {getInitials(doctorName)}
          </div>
          {/* Online Status Indicator */}
          {isWorking && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
          {/* Profile Info */}
          <div className="px-4 py-3 border-b border-slate-200">
            <p className="text-sm font-semibold text-slate-800">{doctorName}</p>
            <p className="text-xs text-slate-500 mt-0.5">{doctorRole}</p>
          </div>

          {/* Work Status */}
          <div className="px-4 py-3 border-b border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">Work Status</span>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                isWorking ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isWorking ? 'bg-green-500' : 'bg-slate-400'}`} />
                {isWorking ? 'Online' : 'Offline'}
              </div>
            </div>

            {(isWorking || workSecondsToday > 0) && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-blue-50 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600" />
                <div className="flex-1">
                  <p className="text-xs text-slate-600">
                    {isWorking ? 'Working Time Today' : 'Today’s Work'}
                  </p>
                  <p className="text-sm font-semibold text-blue-600">{formatTime(elapsedTime)}</p>
                </div>
              </div>
            )}

            {isWorking ? (
              <button
                onClick={handleStopWork}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
              >
                <Square className="w-4 h-4" />
                Stop Work
              </button>
            ) : (
              <button
                onClick={handleStartWork}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all font-medium text-sm shadow-lg shadow-blue-500/30"
              >
                <Play className="w-4 h-4" />
                Start Work
              </button>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                // Navigate to profile
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors text-sm"
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;
