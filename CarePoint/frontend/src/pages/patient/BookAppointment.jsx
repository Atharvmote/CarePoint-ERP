import { useState,useEffect} from 'react';
import PatientSidebar from './PatientSidebar';
import api from "../../api/api";
import PatientNavbar from './PatientNavbar';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, User, FileText, CheckCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

function BookAppointment() {
  const { user } = useAuth();
  const [step, setStep] = useState(2);
  const [slots,setSlots]= useState([]);
  const {doctorId} = useParams();

  console.log("doctorId",doctorId)

  
    const [formData, setFormData] = useState({
      specialization: '',
      doctor: '',
      date: '',
      timeSlot: '',
      reason: '',
      slotId:'',
      notes: '',
      isEmergency: false,
      emergencyReason: ''
    });

    useEffect(() => {
       console.log("DoctorId:", doctorId);
    console.log("Date:", formData.date);
  
    if (!formData.date || !doctorId) return;

    console.log("Fetching slots for:", doctorId, formData.date);

    const fetchSlots = async () => {
      try {
        const data = await api.getSlots(doctorId, formData.date);
        console.log("Slots received:", data);
        setSlots(data);
      } catch (err) {
        console.error("Slot error:", err);
        toast.error("Failed to load available slots");
      }
    };

    fetchSlots();
  }, [formData.date, doctorId]);

  const specializations = [
    'Cardiologist',
    'Dermatologist',
    'General Physician',
    'Neurologist',
    'Orthopedic',
    'Pediatrician'
  ];


  const handleChange = (field, value) => {
    console.log(field,value)
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'specialization') {
      setFormData(prev => ({ ...prev, doctor: '' }));
    }
  };


const handleSubmit = async (e) => {
  e.preventDefault();

  if (step < 3) {
    setStep(step + 1);
  } else {
    try {
      const appointmentData = {
        slotId: formData.slotId,
        reason: formData.reason
      };

      const res = await api.createAppointment(appointmentData);
      console.log("APPOINTMENT CREATED:", res);

      // If marked as emergency, update immediately
      if (formData.isEmergency) {
        await api.markAppointmentEmergency(res._id, formData.emergencyReason);
        toast.success("Emergency appointment created! Priority given to your appointment.");
      } else {
        toast.success("Appointment booked successfully!");
      }

      setStep(4);

    } catch (err) {
      console.error("Booking error:", err);
      toast.error("Failed to book appointment");
    }
  }
};

  const canProceed = () => {
    if (step === 2) return formData.date && formData.timeSlot;
    if (step === 3) return formData.reason;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <PatientSidebar />
      
      <div className="ml-64">
        <PatientNavbar patientName={user?.name} />
        
        <main className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Book Appointment</h1>
            <p className="text-slate-600">Schedule your visit with our doctors</p>
          </div>

          {/* Progress Steps */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                    step >= stepNumber 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {stepNumber}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-semibold ${step >= stepNumber ? 'text-slate-800' : 'text-slate-500'}`}>
                      {stepNumber === 1 && 'Select Doctor'}
                      {stepNumber === 2 && 'Choose Date & Time'}
                      {stepNumber === 3 && 'Add Details'}
                    </p>
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-24 h-1 mx-4 rounded-full ${step > stepNumber ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="max-w-3xl mx-auto">
            {step !== 4 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Select Doctor */}
              

                  {/* Step 2: Date & Time */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                          <Calendar className="w-4 h-4" />
                          Select Date
                        </label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => handleChange('date', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                          <Clock className="w-4 h-4" />
                          Select Time Slot
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {slots.map(slot => {
                            // Parse AM/PM string to absolute minutes
                            const convertTo24Hour = (timeStr) => {
                              const parts = timeStr.trim().split(' ');
                              if(parts.length < 2) return 0;
                              let [hours, minutes] = parts[0].split(':');
                              hours = parseInt(hours, 10);
                              const period = parts[1].toUpperCase();
                              if (period === 'PM' && hours < 12) hours += 12;
                              if (period === 'AM' && hours === 12) hours = 0;
                              return hours * 60 + parseInt(minutes, 10);
                            };

                            const today = new Date().toISOString().split('T')[0];
                            const isToday = formData.date === today;
                            let isPastTime = false;

                            if (isToday) {
                              const now = new Date();
                              const currentMinutes = now.getHours() * 60 + now.getMinutes();
                              const slotMinutes = convertTo24Hour(slot.time);
                              
                              if (slotMinutes <= currentMinutes) {
                                isPastTime = true;
                              }
                            }
                            
                            // Disable if booked OR (is today AND time has already passed)
                            const isDisabled = slot.status === "Booked" || isPastTime;
                            
                            return (
                            <button
                              type='button'
                              key={slot._id}
                              disabled={isDisabled}
                              onClick={() => {
                                handleChange("timeSlot", slot.time);
                                handleChange("slotId", slot._id);
                              }}
                              className={`p-3 border-2 rounded-xl font-semibold text-sm ${
                                isDisabled
                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  : formData.timeSlot === slot.time
                                  ? "border-blue-600 bg-blue-50 text-blue-600"
                                  : "border-slate-200 hover:border-blue-300"
                              }`}
                              title={isPastTime ? "This slot has already passed" : slot.status === "Booked" ? "This slot is booked" : ""}
                            >
                              {slot.time}
                            </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Details */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                          <FileText className="w-4 h-4" />
                          Reason for Visit
                        </label>
                        <select
                          value={formData.reason}
                          onChange={(e) => handleChange('reason', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          required
                        >
                          <option value="">Select reason</option>
                          <option value="Regular Checkup">Regular Checkup</option>
                          <option value="Follow-up">Follow-up</option>
                          <option value="Consultation">Consultation</option>
                          <option value="Emergency">Emergency</option>
                          <option value="Lab Results Review">Lab Results Review</option>
                        </select>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                          <FileText className="w-4 h-4" />
                          Additional Notes (Optional)
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => handleChange('notes', e.target.value)}
                          rows={4}
                          placeholder="Any specific symptoms or concerns..."
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        ></textarea>
                      </div>

                      {/* Emergency Checkbox */}
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={formData.isEmergency}
                            onChange={(e) => handleChange('isEmergency', e.target.checked)}
                            className="w-5 h-5 rounded cursor-pointer"
                          />
                          <span className="text-sm font-semibold text-red-700">Mark as Emergency</span>
                        </label>
                        {formData.isEmergency && (
                          <div className="mt-3">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Emergency Reason
                            </label>
                            <input
                              type="text"
                              placeholder="Brief description of the emergency..."
                              value={formData.emergencyReason}
                              onChange={(e) => handleChange('emergencyReason', e.target.value)}
                              className="w-full px-4 py-2 bg-white border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                              required={formData.isEmergency}
                            />
                          </div>
                        )}
                      </div>

                      {/* Summary */}
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <h4 className="font-semibold text-slate-800 mb-3">Appointment Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Doctor:</span>
                            <span className="font-semibold text-slate-800">{formData.doctor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Specialization:</span>
                            <span className="font-semibold text-slate-800">{formData.specialization}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Date:</span>
                            <span className="font-semibold text-slate-800">{formData.date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Time:</span>
                            <span className="font-semibold text-slate-800">{formData.timeSlot}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 mt-8">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={() => setStep(step - 1)}
                        className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-colors"
                      >
                        Back
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={!canProceed()}
                      className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all ${
                        canProceed()
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/30'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {step === 3 ? 'Confirm Booking' : 'Continue'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Success Message */
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">Appointment Booked Successfully!</h2>
                <p className="text-slate-600 mb-8">Your appointment has been confirmed. You will receive a confirmation email shortly.</p>
                
                <div className="max-w-md mx-auto p-6 bg-blue-50 border border-blue-200 rounded-xl mb-8">
                  <h4 className="font-semibold text-slate-800 mb-4">Appointment Details</h4>
                  <div className="space-y-3 text-sm text-left">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Doctor:</span>
                      <span className="font-semibold text-slate-800">{formData.doctor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Date:</span>
                      <span className="font-semibold text-slate-800">{formData.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Time:</span>
                      <span className="font-semibold text-slate-800">{formData.timeSlot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Booking ID:</span>
                      <span className="font-semibold text-blue-600">#APT-{Math.floor(Math.random() * 10000)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => window.location.href = '/patient/appointments'}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/30"
                  >
                    View My Appointments
                  </button>
                  <button
                    onClick={() => {
                      setStep(1);
                      setFormData({
                        specialization: '',
                        doctor: '',
                        date: '',
                        timeSlot: '',
                        reason: '',
                        notes: ''
                      });
                    }}
                    className="px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-colors"
                  >
                    Book Another
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default BookAppointment;
