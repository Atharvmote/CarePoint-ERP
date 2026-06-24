import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

function NotificationDropdown({ title = 'Notifications', subtitle = 'Real-time updates' }) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors group"
      >
        <span className="sr-only">Open notifications</span>
        <Bell className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
        )}
      </button>

      <div
        className={`absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden transition-all duration-200 ${
          isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
          <div className="flex gap-2">
            {notifications.length > 0 && (
                <button onClick={clearAll} className="text-red-500 hover:text-red-700 text-xs font-medium">Clear All</button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 text-sm ml-2"
            >
              Close
            </button>
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto">
          {!notifications.length ? (
            <div className="p-4 text-sm text-slate-600">No notifications yet.</div>
          ) : (
            notifications.map((note) => (
              <div 
                key={note._id || note.id} 
                className={`px-4 py-4 border-b last:border-b-0 cursor-pointer ${!note.read ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                onClick={() => {
                  if (!note.read) markAsRead(note._id || note.id);
                }}
              >
                <div className="flex items-start justify-between">
                    <p className={`text-sm ${!note.read ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>{note.title}</p>
                    {!note.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
                </div>
                <div className="flex flex-col text-xs mt-1 space-y-1">
                  <span className={`${!note.read ? 'text-slate-700' : 'text-slate-500'}`}>{note.message}</span>
                  <span className="text-slate-400">{new Date(note.timestamp || note.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationDropdown;
