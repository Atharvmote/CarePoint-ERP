// this is admin dashboard

import MainLayout from '../../layout/MainLayout';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import { Users, Calendar, Activity, TrendingUp, Clock, ArrowUp, AlertCircle, CheckCircle, UserCheck, FileText, Pill } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api/api';
import { toast } from 'react-toastify';


function Dashboard() {

  const [dashboardData, setDashboardData] = useState(null);
  
  useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const data = await api.getDashboardStats();
      setDashboardData(data);
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("Failed to load dashboard data");
    }
  };
  fetchDashboard();

}, []);


const colorClasses = {
  blue: "from-blue-500 to-blue-600",
  purple: "from-purple-500 to-purple-600",
  green: "from-green-500 to-green-600",
  orange: "from-orange-500 to-orange-600",
  red: "from-red-500 to-red-600",
  cyan: "from-cyan-500 to-cyan-600",
};

// Main stats cards
const stats = dashboardData ? [
  {
    title: 'Active Doctors',
    value: dashboardData.onlineDoctors,
    subtitle: `of ${dashboardData.totalDoctors} total`,
    trend: 'up',
    icon: Users,
    color: 'green'
  },
  {
    title: 'In-Progress Appointments',
    value: dashboardData.inProgressAppointments,
    subtitle: `${dashboardData.scheduledAppointments} scheduled`,
    trend: 'up',
    icon: Activity,
    color: 'blue'
  },
  {
    title: 'Today Bookings',
    value: dashboardData.todayBookedSlots,
    subtitle: `of ${dashboardData.todayTotalSlots} slots`,
    trend: 'up',
    icon: Calendar,
    color: 'purple'
  },
  {
    title: 'Total Patients',
    value: dashboardData.totalPatients,
    subtitle: `Active users`,
    trend: 'up',
    icon: UserCheck,
    color: 'cyan'
  }
] : [];

// Doctor status breakdown
const doctorStats = dashboardData ? [
  {
    title: 'Online Now',
    value: dashboardData.onlineDoctors,
    color: 'green',
    icon: '🟢'
  },
  {
    title: 'Busy',
    value: dashboardData.busyDoctors,
    color: 'yellow',
    icon: '🟡'
  },
  {
    title: 'Offline',
    value: dashboardData.offlineDoctors,
    color: 'red',
    icon: '🔴'
  }
] : [];

// Appointment status breakdown
const appointmentStats = dashboardData ? [
  { label: 'Scheduled', value: dashboardData.scheduledAppointments, color: 'bg-blue-100 text-blue-700' },
  { label: 'In Progress', value: dashboardData.inProgressAppointments, color: 'bg-purple-100 text-purple-700' },
  { label: 'Completed', value: dashboardData.completedAppointments, color: 'bg-green-100 text-green-700' },
  { label: 'Cancelled', value: dashboardData.cancelledAppointments, color: 'bg-red-100 text-red-700' }
] : [];

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard Overview</h1>
        <p className="text-slate-600">Real-time system workflow and analytics</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} hover>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[stat.color]} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    <ArrowUp className="w-3 h-3" />
                  </div>
                </div>
                <p className="text-slate-600 text-sm font-medium mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-2">{stat.subtitle}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Doctor & Appointment Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Doctor Status */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Doctor Status</h2>
            <div className="space-y-3">
              {doctorStats.map((stat) => (
                <div key={stat.title} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className="font-medium text-slate-700">{stat.title}</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Appointment Status Breakdown */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Appointment Pipeline</h2>
            <div className="space-y-3">
              {appointmentStats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-700">{stat.label}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${stat.color}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* System Health & Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Medical Data */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Medical Data</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-slate-700">Medical Records</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{dashboardData?.totalMedicalRecords || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-slate-700">Prescriptions</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{dashboardData?.totalPrescriptions || 0}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Resources */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Resource Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-700">Total Resources</span>
                <span className="text-2xl font-bold text-slate-800">{dashboardData?.totalResources || 0}</span>
              </div>
              {dashboardData?.criticalCount > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-slate-700">Critical</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">{dashboardData.criticalCount}</span>
                </div>
              )}
              {dashboardData?.lowCount > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="font-medium text-slate-700">Low Stock</span>
                  <span className="text-2xl font-bold text-yellow-600">{dashboardData.lowCount}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Appointments Timeline */}
      <Card>
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Today's Appointment Flow</h2>
          <p className="text-sm text-slate-600 mt-1">{dashboardData?.todayAppointments?.length || 0} appointments today</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Doctor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Date & Time</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Reason</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {dashboardData?.todayAppointments?.map((apt) => (
                <tr key={apt._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{apt.patient?.user?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-slate-600">Dr. {apt.doctor?.user?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(apt.date).toLocaleDateString()} - {apt.time}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{apt.type}</td>
                  <td className="px-6 py-4"><StatusBadge status={apt.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!dashboardData?.todayAppointments?.length && (
            <div className="text-center py-8 text-slate-500">
              No appointments scheduled for today
            </div>
          )}
        </div>
      </Card>
    </MainLayout>
  );
}

export default Dashboard;

