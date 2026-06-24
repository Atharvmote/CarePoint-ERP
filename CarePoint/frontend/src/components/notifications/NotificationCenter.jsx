import { Bell, X, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';

function NotificationCenter({ notifications, onClear, onRemove }) {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment-scheduled':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'appointment-cancelled':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'prescription-issued':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'status-update':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'appointment-scheduled':
        return 'bg-green-50 border-l-4 border-green-400';
      case 'appointment-cancelled':
        return 'bg-red-50 border-l-4 border-red-400';
      case 'prescription-issued':
        return 'bg-blue-50 border-l-4 border-blue-400';
      case 'status-update':
        return 'bg-yellow-50 border-l-4 border-yellow-400';
      default:
        return 'bg-slate-50 border-l-4 border-slate-400';
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg flex items-start justify-between gap-3 ${getNotificationColor(notification.type)}`}
        >
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800">{notification.message}</p>
              <p className="text-xs text-slate-600 mt-1">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <button
            onClick={() => onRemove(notification.id)}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      
      {notifications.length > 3 && (
        <button
          onClick={onClear}
          className="w-full py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
        >
          Clear All
        </button>
      )}
    </div>
  );
}

export default NotificationCenter;
