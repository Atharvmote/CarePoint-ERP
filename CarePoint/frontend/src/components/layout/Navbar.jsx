import { Search, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../api/api';
import NotificationDropdown from './NotificationDropdown';

function Navbar({ user }) {

 const [doctorStatus, setDoctorStatus] = useState(null);
 const [open, setOpen] = useState(false);


  // Fetch doctor status if role is doctor
  useEffect(() => {
    const fetchStatus = async () => {
      if (user?.role === "doctor") {
        try {
          const res = await api.getMyDoctorProfile(); 
          setDoctorStatus(res.status);
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchStatus();
  }, [user]);

  const handleStartWork = async () => {
    await api.startWork();
    setDoctorStatus("online");
  };

  const handleEndWork = async () => {
    await api.endWork();
    setDoctorStatus("offline");
  };



  const handleLogout = async () => {
    try {
      api.logout();
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
    }
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
                placeholder="Search patients, doctors, appointments..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4 ml-6">

            <NotificationDropdown />

            {/* Settings */}
            <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors group">
              <Settings className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
            </button>

            {/* User Profile */}
            <div className="relative">
                <div
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer"
                >
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user?.role}
                    </p>
                  </div>

                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                    {user?.name
                      ? user.name
                          .split(" ")
                          .map(word => word[0])
                          .join("")
                          .toUpperCase()
                      : "U"}
                  </div>
                </div>

              {/* DROPDOWN */}
              {open && (
                <div className="absolute right-0 mt-3 w-48 bg-white shadow-xl rounded-xl border border-slate-200 z-50 p-3 space-y-2">

                  <p className="text-sm font-semibold text-slate-700">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500 mb-2">
                    {user?.role}
                  </p>

                  {/* Doctor Start/End */}
                  {user?.role === "doctor" && (
                    doctorStatus === "online" ? (
                      <button
                        onClick={handleEndWork}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 text-sm"
                      >
                        End Work
                      </button>
                    ) : (
                      <button
                        onClick={handleStartWork}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 text-green-600 text-sm"
                      >
                        Start Work
                      </button>
                    )
                  )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-sm"
                    >
                      Logout
                    </button>

              </div>
            )}
          </div>
                    </div>
                  </div>
                </div>
              </header>
            );
          }

export default Navbar;
