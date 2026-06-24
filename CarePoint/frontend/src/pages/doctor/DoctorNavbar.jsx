import { useState, useEffect } from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import api from '../../api/api';

function DoctorNavbar({ doctorName, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      try {
        const data = await api.getDoctorAppointments();
        const feed = data
          .filter((item) => [
            'scheduled',
            'cancelled',
            'in-progress',
            'completed'
          ].includes(item.status))
          .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
          .slice(0, 6)
          .map((item) => ({
            id: item._id,
            title: `${item.patient?.name || 'Patient'} ${getNotificationText(item.status)}`,
            subtitle: item.time ? item.time : item.date || '',
            status: item.status
          }));

        setNotifications(feed);
      } catch (error) {
        console.error('Notification load error', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const getNotificationText = (status) => {
    switch (status) {
      case 'scheduled':
        return 'booked an appointment';
      case 'cancelled':
        return 'cancelled an appointment';
      case 'in-progress':
        return 'started their appointment';
      case 'completed':
        return 'completed their appointment';
      default:
        return 'updated an appointment';
    }
  };

  const badgeCount = notifications.filter((note) => note.status !== 'completed').length;

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
                placeholder="Search patients, appointments..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4 ml-6 relative">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors group"
              >
                <Bell className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                {badgeCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              <div className={`absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden transition-all duration-200 ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Notifications</p>
                    <p className="text-xs text-slate-500">Recent appointment updates</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-slate-700 text-sm"
                  >
                    Close
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-sm text-slate-600">Loading notifications...</div>
                  ) : !notifications.length ? (
                    <div className="p-4 text-sm text-slate-600">No notifications yet.</div>
                  ) : (
                    notifications.map((note) => (
                      <div key={note.id} className="px-4 py-4 hover:bg-slate-50 border-b last:border-b-0">
                        <p className="text-sm text-slate-900 font-medium">{note.title}</p>
                        <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                          <span>{note.subtitle}</span>
                          <span className="capitalize">{note.status.replace('-', ' ')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-4 py-3 bg-slate-50 text-xs text-slate-500">
                  Notifications are pulled from your latest doctor appointments.
                </div>
              </div>
            </div>

            {/* Settings */}
            <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors group">
              <Settings className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
            </button>

            {/* Profile Dropdown */}
            <div className="pl-4 border-l border-slate-200">
              <ProfileDropdown
                doctorName={doctorName}
                doctorRole="Doctor"
                onLogout={onLogout}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default DoctorNavbar;
