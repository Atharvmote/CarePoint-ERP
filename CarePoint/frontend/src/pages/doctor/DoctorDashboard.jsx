import { useState, useEffect } from "react";
import DoctorSidebar from "./DoctorSidebar";
import DoctorNavbar from "./DoctorNavbar";
import StatCard from "./StatCard";
import MedicalRecordModal from "../../components/modals/MedicalRecordModal";
import PrescriptionModal from "../../components/modals/PrescriptionModal";
import AppointmentCompletionModal from "../../components/modals/AppointmentCompletionModal";
import DoctorScheduleSettings from "../../components/doctor/DoctorScheduleSettings";
import VideoConsultationModal from "../../components/modals/VideoConsultationModal";
import { Calendar, Clock, CheckCircle, PlayCircle, FileText, Pill, AlertCircle, Settings, Video } from "lucide-react";
import api from "../../api/api";
import { toast } from 'react-toastify';

function DoctorDashboard() {

  const [dashboardData, setDashboardData] = useState(null);
  const [showMedicalRecordModal, setShowMedicalRecordModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activeVideoAppt, setActiveVideoAppt] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  console.log(dashboardData)

  const user = JSON.parse(localStorage.getItem("user"));

  //this is used to fetch dr dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await api.getDoctorDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error("Dashboard error", err);
        toast.error("Failed to load dashboard data");
      }
    };

    fetchDashboard();
  }, []);

  // this is used to fetch the dr total appoinments


    const handleStartAppointment = async (id) => {
      try {
        await api.startAppointment(id);
        setDashboardData(prev => ({
          ...prev,
          todayAppointments: prev.todayAppointments.map(a =>
            a._id === id ? { ...a, status: "in-progress" } : a
          )
        }));
        toast.success("Appointment started successfully");
      } catch (err) {
        console.error(err);
        toast.error("Failed to start appointment");
      }
    };

    const handleCompleteAppointment = (appointment) => {
      setSelectedAppointment(appointment);
      setShowCompletionModal(true);
    };

    const handleCompletionSuccess = (updatedAppointment) => {
      setDashboardData(prev => ({
        ...prev,
        todayAppointments: prev.todayAppointments.map(a =>
          a._id === updatedAppointment._id ? { ...a, status: "completed" } : a
        )
      }));
      setShowCompletionModal(false);
    };

    const handleOpenMedicalRecord = (appointment) => {
      setSelectedAppointment(appointment);
      setShowMedicalRecordModal(true);
    };

    const handleOpenPrescription = (appointment) => {
      setSelectedAppointment(appointment);
      setShowPrescriptionModal(true);
    };

    const handleCloseModals = () => {
      setShowMedicalRecordModal(false);
      setShowPrescriptionModal(false);
      setSelectedAppointment(null);
    };

  const getStatusBadge = (status) => {
    const configs = {
      scheduled: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        border: "border-purple-200",
        label: "Scheduled",
      },
      "in-progress": {
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-200",
        label: "In Progress",
      },
      completed: {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-200",
        label: "Completed",
      },
    };

    return configs[status] || configs.scheduled;
  };

  const formatWorkHours = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">

      <DoctorSidebar />

      <div className="ml-64">

        <DoctorNavbar doctorName={user?.name} onLogout={handleLogout} />

        <main className="p-6">

          {/* Welcome */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Welcome back, {user?.name}
            </h1>
            <p className="text-slate-600">
              Here's what's happening today.
            </p>
            </div>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Settings className="w-4 h-4" />
              Schedule Settings
            </button>
          </div>

          {/* Stats */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            <StatCard
              title="Total Appointments Today"
              value={dashboardData?.totalToday || 0}
              icon={Calendar}
              iconBgColor="bg-blue-100"
              iconColor="text-blue-600"
            />

            <StatCard
              title="Pending Appointments"
              value={dashboardData?.pending || 0}
              icon={Clock}
              iconBgColor="bg-purple-100"
              iconColor="text-purple-600"
            />

            <StatCard
              title="Completed Today"
              value={dashboardData?.completed || 0}
              icon={CheckCircle}
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
            />

            <StatCard
              title="Working Hours Today"
              value={formatWorkHours(dashboardData?.workHoursToday || 0)}
              icon={Clock}
              iconBgColor="bg-teal-100"
              iconColor="text-teal-600"
            />

            <StatCard
              title="Next Appointment"
              value={dashboardData?.nextAppointment || "None"}
              icon={PlayCircle}
              iconBgColor="bg-orange-100"
              iconColor="text-orange-600"
            />

          </div>

          {/* Today's Appointments */}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">

            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">
                  Today's Appointments
                </h2>
                {dashboardData?.todayAppointments?.filter(a => a.isEmergency).length > 0 && (
                  <div className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {dashboardData.todayAppointments.filter(a => a.isEmergency).length} Emergency
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Banner */}
            {dashboardData?.todayAppointments?.filter(a => a.isEmergency).length > 0 && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">
                    You have {dashboardData.todayAppointments.filter(a => a.isEmergency).length} emergency appointment(s)
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    These have been prioritized and appear first in your list.
                  </p>
                </div>
              </div>
            )}

            <table className="w-full">

              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                    Patient
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                    Time
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                    Reason
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                    Status
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>

                {dashboardData?.todayAppointments
                  ?.sort((a, b) => {
                    // Emergency appointments first
                    if (a.isEmergency !== b.isEmergency) {
                      return a.isEmergency ? -1 : 1;
                    }
                    // Then by status priority
                    const statusOrder = { "scheduled": 0, "in-progress": 1, "completed": 2 };
                    return statusOrder[a.status] - statusOrder[b.status];
                  })
                  .map((appointment) => {

                  const statusConfig = getStatusBadge(appointment.status);

                  return (
                    <tr key={appointment._id} className={appointment.isEmergency ? "bg-red-50" : ""}>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {appointment.isEmergency && (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          {appointment.patient.name}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {appointment.time}
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p>{appointment.reason}</p>
                          {appointment.isEmergency && (
                            <p className="text-xs text-red-600 mt-1">⚠️ {appointment.emergencyReason}</p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">

                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                          {statusConfig.label}
                        </span>

                      </td>

                      <td className="px-6 py-4">
                        {appointment.status === "scheduled" && (
                          <button
                            onClick={() => handleStartAppointment(appointment._id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded"
                          >
                            Start
                          </button>
                        )}

                        {appointment.status === "in-progress" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setActiveVideoAppt(appointment)}
                              className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition shadow-sm shadow-purple-500/30"
                            >
                              <Video className="w-4 h-4" />
                              Join Call
                            </button>
                            <button
                              onClick={() => handleCompleteAppointment(appointment)}
                              className="px-3 py-1 bg-green-600 text-white rounded"
                            >
                              Complete
                            </button>
                          </div>
                        )}

                        {appointment.status === "completed" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenMedicalRecord(appointment)}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm"
                            >
                              <FileText className="w-3 h-3" />
                              Record
                            </button>
                            <button
                              onClick={() => handleOpenPrescription(appointment)}
                              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm"
                            >
                              <Pill className="w-3 h-3" />
                              Rx
                            </button>
                          </div>
                        )}

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

          {/* Upcoming */}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200">

            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">
                Upcoming Appointments
              </h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">

              {dashboardData?.upcomingAppointments?.map((appointment) => (

                <div key={appointment._id} className="p-4 border rounded-xl">

                  <p className="font-semibold">{appointment.patient.name}</p>

                  <p className="text-sm text-slate-500">
                    {appointment.reason}
                  </p>

                  <p className="text-xs text-slate-600 mt-2">
                    {appointment.date} • {appointment.time}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </main>

      </div>

      {/* Modals */}
      {showMedicalRecordModal && selectedAppointment && (
        <MedicalRecordModal
          isOpen={showMedicalRecordModal}
          onClose={handleCloseModals}
          appointment={selectedAppointment}
          patient={selectedAppointment.patient}
        />
      )}

      {showPrescriptionModal && selectedAppointment && (
        <PrescriptionModal
          isOpen={showPrescriptionModal}
          onClose={handleCloseModals}
          appointment={selectedAppointment}
          patient={selectedAppointment.patient}
        />
      )}

      {showCompletionModal && selectedAppointment && (
        <AppointmentCompletionModal
          appointment={selectedAppointment}
          onClose={() => setShowCompletionModal(false)}
          onSuccess={handleCompletionSuccess}
        />
      )}

      {showScheduleModal && (
        <DoctorScheduleSettings
          onClose={() => setShowScheduleModal(false)}
          onSave={() => {
            setShowScheduleModal(false);
            // Refresh dashboard if needed
          }}
        />
      )}

      {activeVideoAppt && (
        <VideoConsultationModal
          appointmentId={activeVideoAppt._id}
          userName={`Dr. ${dashboardData?.doctorData?.user?.name || user?.name || ''}`}
          onClose={() => setActiveVideoAppt(null)}
        />
      )}

    </div>
  );
}

export default DoctorDashboard;