import { useState } from 'react';
import { 
  Home, Users, Calendar, FileText, Package, 
  Menu, X, LogOut, ChevronRight, ShieldCheck, UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

const menuItems = [
  { id: '/dashboard', label: 'Dashboard', icon: Home },
  { id: '/inquiries', label: 'Inquiries', icon: FileText },
  { id: '/doctors', label: 'Doctors', icon: Users },
  { id: '/staff', label: 'Staff', icon: ShieldCheck },
  { id: '/patients', label: 'Patients', icon: UserCheck },
  { id: '/slots', label: 'Slot Management', icon: Calendar },
  { id: '/resources', label: 'Resources', icon: Package },
];

  return (
    <aside className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
      sidebarOpen ? 'w-64' : 'w-20'
    } bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 shadow-2xl`}>
      
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/50">
        {sidebarOpen && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">CarePoint</h1>
              <p className="text-xs text-blue-300 font-medium">Healthcare ERP</p>
            </div>
          </div>
        )}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5 text-slate-400" />
          ) : (
            <Menu className="w-5 h-5 text-slate-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-8 bg-white rounded-r-full" />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} transition-colors flex-shrink-0`} />
              {sidebarOpen && (
                <>
                  <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-700/50">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
