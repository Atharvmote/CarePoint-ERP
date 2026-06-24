import React, { useEffect, useState } from 'react';
import DoctorSidebar from './DoctorSidebar';
import DoctorNavbar from './DoctorNavbar';
import ChatPanel from '../../components/ChatPanel';
import { Eye, XCircle } from 'lucide-react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';

function DoctorAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await api.getDoctorAppointments();
        setAppointments(data);
      } catch (err) {
        console.error("Failed to load appointments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetails(true);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <DoctorSidebar />
      <div className="flex-1 flex flex-col ml-64 bg-slate-50/50">
        <DoctorNavbar doctorName="Doctor" />
        <main className="flex-1 overflow-y-auto p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">All Appointments</h1>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Date & Time</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Patient</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Type</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr><td colSpan="4" className="text-center py-6 text-slate-500">Loading appointments...</td></tr>
                  ) : appointments.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-6 text-slate-500">No appointments found.</td></tr>
                  ) : (
                    appointments.map(a => (
                      <tr key={a._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                          {new Date(a.date).toLocaleDateString()} at {a.time}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {a.patient?.user?.name || a.patient?.name || 'Unknown Patient'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 capitalize">{a.type}</td>
                        <td className="px-6 py-4 flex items-center gap-3">
                          <StatusBadge status={a.status} />
                          <button
                            onClick={() => handleViewDetails(a)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details & Chat"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Appointment Details Modal with Chat */}
      {showDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden grid grid-cols-2 gap-0">
            {/* Left Side: Appointment Details */}
            <div className="border-r border-slate-200 overflow-y-auto">
              <div className="p-6 border-b border-slate-200 sticky top-0 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Appointment Details</h2>
                    <p className="text-sm text-slate-600 mt-1">Booking ID: {selectedAppointment._id}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Patient Info */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {(selectedAppointment.patient?.user?.name || selectedAppointment.patient?.name || "P").charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800">{selectedAppointment.patient?.user?.name || selectedAppointment.patient?.name || "Patient"}</h3>
                    <p className="text-sm text-slate-600">Patient</p>
                  </div>
                  <StatusBadge status={selectedAppointment.status} />
                </div>

                {/* Appointment Details */}
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">Appointment Details</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Date</p>
                      <p className="text-slate-800 font-medium">{selectedAppointment.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Time</p>
                      <p className="text-slate-800 font-medium">{selectedAppointment.time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Type</p>
                      <p className="text-slate-800 font-medium capitalize">{selectedAppointment.type || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Reason</p>
                      <p className="text-slate-800 font-medium">{selectedAppointment.reason || "General Consultation"}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200">
                  <p className="text-sm text-slate-600 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    💬 Use the chat on the right to communicate with the patient and share reports/documents
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side: Chat Panel */}
            <div className="relative">
              {selectedAppointment && (
                <ChatPanel 
                  appointment={selectedAppointment}
                  onClose={() => setShowDetails(false)}
                />
              )}
              <button
                onClick={() => setShowDetails(false)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors z-10 bg-white"
              >
                <XCircle className="w-6 h-6 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorAppointments;
