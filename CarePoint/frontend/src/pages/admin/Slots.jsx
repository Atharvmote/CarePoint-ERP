import { useState, useEffect } from 'react';
import api from '../../api/api';
import MainLayout from '../../layout/MainLayout';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import { Plus, Calendar, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

function Slots() {
  const [slots, setSlots] = useState([]);
  useEffect(() => {

  const fetchSlots = async () => {

    try {
      const data = await api.getSlots();
      const formatted = data.map(slot => ({
        id: slot._id,
        time: slot.time,
        doctor: slot.doctor?.name || "Doctor",
        patient: slot.patientName || null,
        status: slot.isBooked ? "booked" : "available"
      }));
      setSlots(formatted);
    } catch(error) {
      console.error("Slot fetch error:", error);
      toast.error("Failed to load slots");
    }
  };
  fetchSlots();
}, []);


  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Slot Management</h1>
          <p className="text-slate-600">Manage appointment slots</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 shadow-lg">
          <Plus className="w-5 h-5" />
          Create Slot
        </button>
      </div>

      <Card>
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Today's Schedule</h2>
          <p className="text-sm text-slate-600">Friday, February 14, 2026</p>
        </div>
        <div className="p-6 space-y-3">
          {slots.map((slot) => (
            <div key={slot.id} className={`flex items-center justify-between p-4 rounded-xl border ${slot.status === 'available' ? 'bg-green-50 border-green-200' : slot.status === 'booked' ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold text-slate-800">{slot.time}</span>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div>
                  <p className="font-medium text-slate-800">{slot.doctor}</p>
                  {slot.patient && <p className="text-sm text-slate-600">Patient: {slot.patient}</p>}
                </div>
              </div>
              <StatusBadge status={slot.status} />
            </div>
          ))}
        </div>
      </Card>
    </MainLayout>
  );
}

export default Slots;
