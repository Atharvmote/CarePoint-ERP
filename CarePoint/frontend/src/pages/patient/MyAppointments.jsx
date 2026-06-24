import { useState, useEffect } from 'react';
import PatientSidebar from './PatientSidebar';
import PatientNavbar from './PatientNavbar';
import { Calendar, Clock, Search, Eye, XCircle, User, Phone, Mail, Video } from 'lucide-react';
import VideoConsultationModal from '../../components/modals/VideoConsultationModal';
import ChatPanel from '../../components/ChatPanel';
import { useAuth } from '../../context/AuthContext';
import api from "../../api/api.js"
import { toast } from 'react-toastify';

function MyAppointments() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeVideoAppt, setActiveVideoAppt] = useState(null);
  const { user } = useAuth();


  useEffect(()=>{
    const fetchApoinmentData = async ()=>{
      try {
        const data = await api.getPatientAppointments();
        // Keep the full appointment object with all necessary IDs
        const formatted = data.map(appointment => ({
          ...appointment,
          id: appointment._id,
          doctorName: appointment.doctor?.user?.name || "Doctor",
          doctorSpecialization: appointment.doctor?.specialty || "Specialty",
          doctorPhone: appointment.doctor?.user?.phone || "N/A",
          doctorEmail: appointment.doctor?.user?.email || "N/A",
          location: "Medical Center",
          bookingId: appointment._id
        }));
        setAppointments(formatted);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load appointments");
      }
    }
    fetchApoinmentData();
  },[])




  // const appointments = [
  //   {
  //     id: 1,
  //     doctorName: 'Dr. Emily Smith',
  //     doctorSpecialization: 'Cardiologist',
  //     doctorPhone: '+1 (555) 123-4567',
  //     doctorEmail: 'emily.smith@carepoint.com',
  //     date: '2026-02-28',
  //     time: '10:00 AM',
  //     status: 'scheduled',
  //     reason: 'Follow-up Visit',
  //     location: 'New York Medical Center, Room 301',
  //     notes: 'Bring previous reports',
  //     bookingId: 'APT-1234'
  //   },
  //   {
  //     id: 2,
  //     doctorName: 'Dr. Michael Johnson',
  //     doctorSpecialization: 'General Physician',
  //     doctorPhone: '+1 (555) 234-5678',
  //     doctorEmail: 'michael.johnson@carepoint.com',
  //     date: '2026-02-27',
  //     time: '02:30 PM',
  //     status: 'completed',
  //     reason: 'Regular Checkup',
  //     location: 'City Hospital, Room 105',
  //     notes: 'Annual physical examination',
  //     bookingId: 'APT-1198',
  //     prescription: 'Vitamin D supplements - Take once daily',
  //     diagnosis: 'Overall health is good. Slight vitamin D deficiency detected.'
  //   },
  //   {
  //     id: 3,
  //     doctorName: 'Dr. Sarah Davis',
  //     doctorSpecialization: 'Dermatologist',
  //     doctorPhone: '+1 (555) 345-6789',
  //     doctorEmail: 'sarah.davis@carepoint.com',
  //     date: '2026-03-05',
  //     time: '11:00 AM',
  //     status: 'scheduled',
  //     reason: 'Skin Consultation',
  //     location: 'Skin Care Clinic, Room 202',
  //     notes: 'Bring list of current medications',
  //     bookingId: 'APT-1289'
  //   },
  //   {
  //     id: 4,
  //     doctorName: 'Dr. James Wilson',
  //     doctorSpecialization: 'Orthopedic',
  //     doctorPhone: '+1 (555) 456-7890',
  //     doctorEmail: 'james.wilson@carepoint.com',
  //     date: '2026-02-20',
  //     time: '09:00 AM',
  //     status: 'cancelled',
  //     reason: 'Knee Pain Consultation',
  //     location: 'Bone & Joint Center',
  //     notes: 'Patient requested cancellation',
  //     bookingId: 'APT-1156'
  //   },
  //   {
  //     id: 5,
  //     doctorName: 'Dr. Robert Chen',
  //     doctorSpecialization: 'Neurologist',
  //     doctorPhone: '+1 (555) 567-8901',
  //     doctorEmail: 'robert.chen@carepoint.com',
  //     date: '2026-02-15',
  //     time: '03:00 PM',
  //     status: 'completed',
  //     reason: 'Headache Issues',
  //     location: 'Neuro Care Center',
  //     notes: 'Recurring migraines',
  //     bookingId: 'APT-1089',
  //     prescription: 'Sumatriptan 50mg - As needed for migraines',
  //     diagnosis: 'Migraine headaches. Stress-related triggers identified.'
  //   }
  // ];

  const getStatusBadge = (status) => {
    const configs = {
      scheduled: {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        border: 'border-purple-200',
        label: 'Scheduled'
      },
      completed: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        label: 'Completed'
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        label: 'Cancelled'
      }
    };
    return configs[status] || configs.scheduled;
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesFilter = selectedFilter === 'all' || apt.status === selectedFilter;
    const matchesSearch = apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          apt.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filterOptions = [
    { value: 'all', label: 'All', count: appointments.length },
    { value: 'scheduled', label: 'Scheduled', count: appointments.filter(a => a.status === 'scheduled').length },
    { value: 'completed', label: 'Completed', count: appointments.filter(a => a.status === 'completed').length },
    { value: 'cancelled', label: 'Cancelled', count: appointments.filter(a => a.status === 'cancelled').length }
  ];

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetails(true);
  };

const handleCancelAppointment = async (appointmentId) => {
  if (window.confirm('Are you sure you want to cancel this appointment?')) {
    try {
      await api.cancelAppointment(appointmentId);

      // 🔥 update UI instantly
      setAppointments(prev =>
        prev.map(appt =>
          appt.id === appointmentId
            ? { ...appt, status: "cancelled" }
            : appt
        )
      );

    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel appointment");
    }
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <PatientSidebar />
      
      <div className="ml-64">
        <PatientNavbar patientName={user?.name} />
        
        <main className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">My Appointments</h1>
            <p className="text-slate-600">View and manage your appointments</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by doctor name or reason..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 overflow-x-auto">
                {filterOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedFilter(option.value)}
                    className={`px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                      selectedFilter === option.value
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {option.label} ({option.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                        <p className="text-slate-600 font-medium">No appointments found</p>
                        <p className="text-sm text-slate-500 mt-1">Try adjusting your filters</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((appointment) => {
                      const statusConfig = getStatusBadge(appointment.status);
                      
                      return (
                        <tr key={appointment.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {appointment.doctorName.charAt(0)||"D"}
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">{appointment.doctorName || "Doctor"}</p>
                                <p className="text-xs text-slate-500">{appointment.doctorSpecialization}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-800">{appointment.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-600">{appointment.time}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-800">{appointment.reason}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewDetails(appointment)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              
                              {appointment.status === 'scheduled' && (
                                <button
                                  onClick={() => handleCancelAppointment(appointment.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Cancel Appointment"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              )}
                              
                              {appointment.status === 'in-progress' && (
                                <button
                                  onClick={() => setActiveVideoAppt(appointment)}
                                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200 bg-purple-50"
                                  title="Join Video Call"
                                >
                                  <Video className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Appointment Details Modal */}
      {showDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden grid grid-cols-2 gap-0">
            {/* Left Side: Appointment Details */}
            <div className="border-r border-slate-200 overflow-y-auto">
              <div className="p-6 border-b border-slate-200 sticky top-0 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Appointment Details</h2>
                    <p className="text-sm text-slate-600 mt-1">Booking ID: {selectedAppointment.bookingId}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Doctor Info */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {selectedAppointment.doctorName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800">{selectedAppointment.doctorName}</h3>
                    <p className="text-sm text-slate-600">{selectedAppointment.doctorSpecialization}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(selectedAppointment.status).bg} ${getStatusBadge(selectedAppointment.status).text} ${getStatusBadge(selectedAppointment.status).border}`}>
                    {getStatusBadge(selectedAppointment.status).label}
                  </span>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">Doctor's Contact</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-800">{selectedAppointment.doctorPhone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-800">{selectedAppointment.doctorEmail}</span>
                    </div>
                  </div>
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
                      <p className="text-sm text-slate-600 mb-1">Reason</p>
                      <p className="text-slate-800 font-medium">{selectedAppointment.reason}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Location</p>
                      <p className="text-slate-800">{selectedAppointment.location}</p>
                    </div>
                  </div>
                </div>

                {/* Diagnosis & Prescription (if completed) */}
                {selectedAppointment.status === 'completed' && (
                  <>
                    {selectedAppointment.diagnosis && (
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-3">Diagnosis</h4>
                        <p className="text-slate-800 p-3 bg-green-50 rounded-lg border border-green-200 text-sm">
                          {selectedAppointment.diagnosis}
                        </p>
                      </div>
                    )}
                    {selectedAppointment.prescription && (
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-3">Prescription</h4>
                        <p className="text-slate-800 p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm">
                          {selectedAppointment.prescription}
                        </p>
                      </div>
                    )}
                  </>
                )}

                <div className="pt-6 border-t border-slate-200 space-y-3">
                  {selectedAppointment.status === 'scheduled' && (
                    <button
                      onClick={() => {
                        handleCancelAppointment(selectedAppointment.id);
                        setShowDetails(false);
                      }}
                      className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
                    >
                      Cancel Appointment
                    </button>
                  )}
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

      {activeVideoAppt && (
        <VideoConsultationModal
          appointmentId={activeVideoAppt.id}
          userName={user?.name || "Patient"}
          onClose={() => setActiveVideoAppt(null)}
        />
      )}
    </div>
  );
}

export default MyAppointments;
