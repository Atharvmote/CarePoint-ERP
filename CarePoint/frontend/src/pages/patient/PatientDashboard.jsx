import PatientSidebar from './PatientSidebar.jsx';
import PatientNavbar from './PatientNavbar.jsx';
import PatientMedicalRecords from './PatientMedicalRecords.jsx';
import PatientPrescriptions from './PatientPrescriptions.jsx';
import { Calendar, Clock, FileText, Heart, ArrowRight, Pill, Video } from 'lucide-react';
import { useEffect, useState } from "react";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import useNotifications from '../../hooks/useNotifications';
import VideoConsultationModal from '../../components/modals/VideoConsultationModal';
import { toast } from 'react-toastify';

function PatientDashboard() {

  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'medical-records', 'prescriptions'
  const [activeVideoAppt, setActiveVideoAppt] = useState(null);

  const {user} = useAuth();
  const { socket } = useNotifications();

  // const stats = [
  //   { 
  //     title: 'Next Appointment', 
  //     value: 'Tomorrow', 
  //     subtitle: '10:00 AM with Dr. Smith',
  //     icon: Calendar,
  //     iconBg: 'bg-blue-100',
  //     iconColor: 'text-blue-600'
  //   },
  //   { 
  //     title: 'Total Appointments', 
  //     value: '24', 
  //     subtitle: '8 completed this year',
  //     icon: Clock,
  //     iconBg: 'bg-purple-100',
  //     iconColor: 'text-purple-600'
  //   },
  //   { 
  //     title: 'Medical Reports', 
  //     value: '12', 
  //     subtitle: '2 new reports available',
  //     icon: FileText,
  //     iconBg: 'bg-green-100',
  //     iconColor: 'text-green-600'
  //   },
  //   { 
  //     title: 'Health Score', 
  //     value: '85/100', 
  //     subtitle: 'Good condition',
  //     icon: Heart,
  //     iconBg: 'bg-red-100',
  //     iconColor: 'text-red-600'
  //   }
  // ];

  // const upcomingAppointments = [
  //   {
  //     id: 1,
  //     doctor: 'Dr. Emily Smith',
  //     specialization: 'Cardiologist',
  //     date: 'Tomorrow',
  //     time: '10:00 AM',
  //     type: 'Follow-up'
  //   },
  //   {
  //     id: 2,
  //     doctor: 'Dr. Michael Johnson',
  //     specialization: 'General Physician',
  //     date: 'Feb 28',
  //     time: '02:30 PM',
  //     type: 'Regular Checkup'
  //   },
  //   {
  //     id: 3,
  //     doctor: 'Dr. Sarah Davis',
  //     specialization: 'Dermatologist',
  //     date: 'Mar 5',
  //     time: '11:00 AM',
  //     type: 'Consultation'
  //   }
  // ];

  const recentReports = [
    { id: 1, name: 'Blood Test Results', date: 'Feb 20, 2026', status: 'Ready' },
    { id: 2, name: 'X-Ray Report', date: 'Feb 15, 2026', status: 'Ready' },
    { id: 3, name: 'ECG Report', date: 'Jan 28, 2026', status: 'Ready' }
  ];



useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const data = await api.getPatientAppointments();
      setAppointments(data);
      // 🔥 calculate stats
      const total = data.length;
      const completed = data.filter(a => a.status === "completed").length;
      const scheduled = data.filter(a => a.status === "scheduled").length;

      const next = data
        .filter(a => (a.status === "scheduled" || a.status === "in-progress") && new Date(a.date) >= new Date(new Date().setHours(0,0,0,0)))
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

      setStats([
        {
          title: "Next Appointment",
          value: next ? next.date : "No upcoming",
          subtitle: next ? `${next.time}` : "",
          icon: Calendar,
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600"
        },
        {
          title: "Total Appointments",
          value: total,
          subtitle: `${completed} completed`,
          icon: Clock,
          iconBg: "bg-purple-100",
          iconColor: "text-purple-600"
        },
        {
          title: "Medical Records",
          value: "View",
          subtitle: "Access your records",
          icon: FileText,
          iconBg: "bg-green-100",
          iconColor: "text-green-600",
          onClick: () => setCurrentView('medical-records')
        },
        {
          title: "Prescriptions",
          value: "View",
          subtitle: "Your medications",
          icon: Pill,
          iconBg: "bg-orange-100",
          iconColor: "text-orange-600",
          onClick: () => setCurrentView('prescriptions')
        }
      ]);

    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    }
  };
  
  fetchDashboard();

  if (socket) {
    const handleStatusUpdate = () => {
      fetchDashboard();
    };
    socket.on('status-update', handleStatusUpdate);
    return () => socket.off('status-update', handleStatusUpdate);
  }
}, [socket]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <PatientSidebar />
      
      <div className="ml-64">
        <PatientNavbar patientName={user?.name} />
        
        <main className="p-6">
          {currentView === 'dashboard' ? (
            <>
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome back, {user?.name}!</h1>
                <p className="text-slate-600">Here's your health overview</p>
              </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow ${stat.onClick ? 'cursor-pointer' : ''}`}
                  onClick={stat.onClick}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm font-medium mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-800 mb-2">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.subtitle}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Appointments */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Upcoming Appointments</h2>
                    <p className="text-sm text-slate-600 mt-1">Your scheduled visits</p>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  {appointments
                    .filter(a => (a.status === "scheduled" || a.status === "in-progress") && new Date(a.date) >= new Date(new Date().setHours(0,0,0,0)))
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, 3).map((appointment) => (
                    <div key={appointment._id || appointment.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {appointment.doctor?.user?.name?.split(" ")[1]?.[0] || "Dr"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{appointment.doctor?.user?.name || "Doctor"}</p>
                          <p className="text-sm text-slate-600">{appointment.doctor.specialty}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="text-sm font-semibold text-slate-800">{new Date(appointment.date).toLocaleDateString()}</p>
                        <p className="text-sm text-slate-600">{appointment.time}</p>
                        {appointment.status === 'in-progress' ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveVideoAppt(appointment); }}
                            className="flex items-center gap-1 mt-1 px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-sm shadow-purple-500/30"
                          >
                            <Video className="w-3 h-3" />
                            Join Call
                          </button>
                        ) : (
                          <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                            {appointment.type || "Consultation"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Reports & Quick Actions */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/30">
                    <Calendar className="w-5 h-5" />
                    <span className="font-semibold text-sm">Book Appointment</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('medical-records')}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    <FileText className="w-5 h-5" />
                    <span className="font-semibold text-sm">Medical Records</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('prescriptions')}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    <Pill className="w-5 h-5" />
                    <span className="font-semibold text-sm">Prescriptions</span>
                  </button>
                </div>
              </div>

              {/* Recent Reports */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Reports</h3>
                <div className="space-y-3">
                  {recentReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{report.name}</p>
                          <p className="text-xs text-slate-500">{report.date}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        {report.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </>
          ) : currentView === 'medical-records' ? (
            <PatientMedicalRecords onBack={() => setCurrentView('dashboard')} />
          ) : currentView === 'prescriptions' ? (
            <PatientPrescriptions onBack={() => setCurrentView('dashboard')} />
          ) : null}
        </main>
      </div>

      {activeVideoAppt && (
        <VideoConsultationModal
          appointmentId={activeVideoAppt._id || activeVideoAppt.id}
          userName={user?.name || "Patient"}
          onClose={() => setActiveVideoAppt(null)}
        />
      )}
    </div>
  );
}

export default PatientDashboard;
