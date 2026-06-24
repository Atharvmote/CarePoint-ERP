import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

function StatusBadge({ status, type = 'default' }) {
  const getConfig = () => {
    const configs = {
      // Appointment statuses
      completed: {
        style: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle,
        label: 'Completed'
      },
      'in-progress': {
        style: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Clock,
        label: 'In Progress'
      },
      scheduled: {
        style: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: Clock,
        label: 'Scheduled'
      },
      cancelled: {
        style: 'bg-red-100 text-red-700 border-red-200',
        icon: XCircle,
        label: 'Cancelled'
      },
      pending: {
        style: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: Clock,
        label: 'Pending'
      },
      resolved: {
        style: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle,
        label: 'Resolved'
      },
      // Resource statuses
      'in-stock': {
        style: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle,
        label: 'In Stock'
      },
      'low-stock': {
        style: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: AlertCircle,
        label: 'Low Stock'
      },
      critical: {
        style: 'bg-red-100 text-red-700 border-red-200',
        icon: AlertCircle,
        label: 'Critical'
      },
      // Doctor statuses
      active: {
        style: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle,
        label: 'Active'
      },
      'on-leave': {
        style: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: Clock,
        label: 'On Leave'
      },
      inactive: {
        style: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: XCircle,
        label: 'Inactive'
      },
      // Slot statuses
      available: {
        style: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle,
        label: 'Available'
      },
      booked: {
        style: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Clock,
        label: 'Booked'
      },
      blocked: {
        style: 'bg-red-100 text-red-700 border-red-200',
        icon: XCircle,
        label: 'Blocked'
      }
    };

    return configs[status] || {
      style: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: AlertCircle,
      label: status
    };
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.style}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

export default StatusBadge;
