import { Search, Settings } from 'lucide-react';
import api from '../../api/api';
import NotificationDropdown from '../../components/layout/NotificationDropdown';

function PatientNavbar({ patientName = "Patient" }) {
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : "P";
  };

  const fetchNotifications = async () => {
    const data = await api.getPatientAppointments();
    return data
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 6)
      .map((item) => ({
        id: item._id,
        title: item.status === 'cancelled'
          ? `Appointment cancelled with ${item.doctor?.name || 'Doctor'}`
          : item.status === 'scheduled'
            ? `Appointment confirmed with ${item.doctor?.name || 'Doctor'}`
            : item.status === 'completed'
              ? `Appointment completed with ${item.doctor?.name || 'Doctor'}`
              : `Appointment update with ${item.doctor?.name || 'Doctor'}`,
        subtitle: item.time ? `${item.date || ''} • ${item.time}` : item.date || '',
        status: item.status || 'updated'
      }));
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search doctors, appointments..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4 ml-6">
            <NotificationDropdown fetchNotifications={fetchNotifications} title="Patient Alerts" subtitle="Your appointment history" />

            {/* Settings */}
            <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors group">
              <Settings className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
            </button>

            {/* Profile */}
            <div className="pl-4 border-l border-slate-200 flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">{patientName}</p>
                <p className="text-xs text-slate-500">Patient</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                {getInitials(patientName)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default PatientNavbar;
