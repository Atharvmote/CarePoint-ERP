import { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import api from '../../api/api.js';
import { toast } from 'react-toastify';

function DoctorScheduleSettings({ onClose, onSave }) {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState({});
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [blockedDateReason, setBlockedDateReason] = useState('');

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const data = await api.getMySchedule();
      setSchedule(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load schedule');
      setLoading(false);
    }
  };

  const handleDayChange = (index, field, value) => {
    const updated = { ...schedule };
    updated.schedule[index][field] = value;
    setSchedule(updated);
  };

  const toggleDay = (index) => {
    const updated = { ...schedule };
    updated.schedule[index].isActive = !updated.schedule[index].isActive;
    setSchedule(updated);
  };

  const handleAddBlockedDate = async () => {
    if (!newBlockedDate || !blockedDateReason) {
      toast.warning('Please fill in all blocked date fields');
      return;
    }

    try {
      const updated = await api.addBlockedDate({
        date: newBlockedDate,
        reason: blockedDateReason
      });
      setSchedule(updated);
      setNewBlockedDate('');
      setBlockedDateReason('');
      toast.success('Blocked date added');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add blocked date');
    }
  };

  const handleRemoveBlockedDate = async (blockedDateId) => {
    try {
      const updated = await api.removeBlockedDate(blockedDateId);
      setSchedule(updated);
      toast.success('Blocked date removed');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove blocked date');
    }
  };

  const handleSaveSchedule = async () => {
    try {
      const updated = await api.createOrUpdateSchedule({
        schedule: schedule.schedule,
        slotDuration: schedule.slotDuration
      });
      setSchedule(updated);
      toast.success('Schedule updated successfully');
      if (onSave) onSave(updated);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save schedule');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 w-full max-w-2xl mx-auto">
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Schedule Settings</h2>
            <p className="text-slate-600">Configure your weekly availability</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Weekly Schedule */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Weekly Schedule</h3>
          <div className="space-y-2">
            {schedule?.schedule?.map((day, index) => (
              <div key={day.dayOfWeek} className="border border-slate-200 rounded-lg p-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedDays(prev => ({
                    ...prev,
                    [index]: !prev[index]
                  }))}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={day.isActive}
                      onChange={() => toggleDay(index)}
                      className="w-5 h-5 rounded cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="font-medium text-slate-800">{day.dayOfWeek}</span>
                    {day.isActive && (
                      <span className="text-sm text-slate-600">
                        {day.startTime} - {day.endTime}
                      </span>
                    )}
                    {!day.isActive && (
                      <span className="text-sm text-red-600">Off</span>
                    )}
                  </div>
                  {expandedDays[index] ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                {expandedDays[index] && day.isActive && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => handleDayChange(index, 'startTime', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => handleDayChange(index, 'endTime', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Slot Duration */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Appointment Slot Duration (minutes)
          </label>
          <input
            type="number"
            value={schedule?.slotDuration || 30}
            onChange={(e) => setSchedule({
              ...schedule,
              slotDuration: parseInt(e.target.value)
            })}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-40"
          />
        </div>

        {/* Blocked Dates */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Blocked Dates</h3>
          
          {/* Add Blocked Date */}
          <div className="mb-4 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-700 mb-3">Add Blocked Date</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newBlockedDate}
                  onChange={(e) => setNewBlockedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g., Conference, Leave"
                  value={blockedDateReason}
                  onChange={(e) => setBlockedDateReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleAddBlockedDate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              Add Date
            </button>
          </div>

          {/* List of Blocked Dates */}
          {schedule?.blockedDates && schedule.blockedDates.length > 0 && (
            <div className="space-y-2">
              {schedule.blockedDates.map((bd) => (
                <div key={bd._id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-800">
                      {new Date(bd.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-600">{bd.reason}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveBlockedDate(bd._id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end border-t border-slate-200 pt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveSchedule}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

export default DoctorScheduleSettings;
