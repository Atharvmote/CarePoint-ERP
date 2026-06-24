import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/api';

function AppointmentCompletionModal({ appointment, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Medical Record, 2: Prescription, 3: Summary

  // Medical Record Data
  const [medicalData, setMedicalData] = useState({
    chiefComplaint: '',
    vitalSigns: {
      bloodPressure: '',
      temperature: '',
      pulse: '',
      weight: ''
    },
    diagnosis: [''],
    treatment: '',
    followUp: '',
    medications: [],
    notes: ''
  });

  // Prescription Data
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '', quantity: 1, instructions: '' }],
    notes: '',
    expiryDate: ''
  });

  const [appointmentNotes, setAppointmentNotes] = useState('');

  // Handle Medical Data Changes
  const handleMedicalChange = (field, value) => {
    setMedicalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVitalChange = (vital, value) => {
    setMedicalData(prev => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        [vital]: value
      }
    }));
  };

  const addDiagnosis = () => {
    setMedicalData(prev => ({
      ...prev,
      diagnosis: [...prev.diagnosis, '']
    }));
  };

  const removeDiagnosis = (index) => {
    setMedicalData(prev => ({
      ...prev,
      diagnosis: prev.diagnosis.filter((_, i) => i !== index)
    }));
  };

  const updateDiagnosis = (index, value) => {
    setMedicalData(prev => ({
      ...prev,
      diagnosis: prev.diagnosis.map((d, i) => i === index ? value : d)
    }));
  };

  // Handle Prescription Changes
  const handlePrescriptionChange = (field, value) => {
    setPrescriptionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addMedication = () => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '', quantity: 1, instructions: '' }]
    }));
  };

  const removeMedication = (index) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const updateMedication = (index, field, value) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  // Submit
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate
      if (step === 1 && !medicalData.chiefComplaint) {
        toast.error('Enter chief complaint');
        setLoading(false);
        return;
      }

      if (step === 2 && prescriptionData.medications.some(m => !m.name)) {
        toast.error('Fill in all medication names');
        setLoading(false);
        return;
      }

      if (step === 3) {
        const result = await api.completeAppointment(appointment._id, {
          medicalRecordData: medicalData,
          prescriptionData: prescriptionData,
          notes: appointmentNotes
        });

        toast.success('Appointment completed successfully!');
        onSuccess(result);
        onClose();
      } else {
        setStep(step + 1);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to complete appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Complete Appointment</h2>
            <p className="text-sm text-slate-600 mt-1">
              Patient: {appointment.patient?.name || 'Unknown'} | {new Date(appointment.date).toLocaleDateString()} {appointment.time}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="flex p-6 border-b border-slate-200 gap-4">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1">
              <button
                onClick={() => setStep(s)}
                className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                  step >= s
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {s === 1 ? 'Medical' : s === 2 ? 'Prescription' : 'Confirm'}
              </button>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1: Medical Record */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Chief Complaint
                </label>
                <textarea
                  value={medicalData.chiefComplaint}
                  onChange={(e) => handleMedicalChange('chiefComplaint', e.target.value)}
                  rows={3}
                  placeholder="What is the patient's main complaint?"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <h3 className="font-semibold text-slate-700 mb-3">Vital Signs</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      placeholder="e.g., 120/80"
                      value={medicalData.vitalSigns.bloodPressure}
                      onChange={(e) => handleVitalChange('bloodPressure', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Temperature (°F)</label>
                    <input
                      type="number"
                      placeholder="98.6"
                      value={medicalData.vitalSigns.temperature}
                      onChange={(e) => handleVitalChange('temperature', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Pulse (bpm)</label>
                    <input
                      type="number"
                      placeholder="72"
                      value={medicalData.vitalSigns.pulse}
                      onChange={(e) => handleVitalChange('pulse', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      placeholder="70"
                      value={medicalData.vitalSigns.weight}
                      onChange={(e) => handleVitalChange('weight', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-700">Diagnosis</h3>
                  <button
                    onClick={addDiagnosis}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm hover:bg-blue-200"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  {medicalData.diagnosis.map((diag, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter diagnosis"
                        value={diag}
                        onChange={(e) => updateDiagnosis(idx, e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
                      />
                      <button
                        onClick={() => removeDiagnosis(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Treatment Plan
                </label>
                <textarea
                  value={medicalData.treatment}
                  onChange={(e) => handleMedicalChange('treatment', e.target.value)}
                  rows={3}
                  placeholder="Recommended treatment..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Follow-up
                </label>
                <input
                  type="text"
                  placeholder="Follow-up instructions..."
                  value={medicalData.followUp}
                  onChange={(e) => handleMedicalChange('followUp', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={medicalData.notes}
                  onChange={(e) => handleMedicalChange('notes', e.target.value)}
                  rows={2}
                  placeholder="Any additional notes..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Step 2: Prescription */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Diagnosis/Indication
                </label>
                <textarea
                  value={prescriptionData.diagnosis}
                  onChange={(e) => handlePrescriptionChange('diagnosis', e.target.value)}
                  rows={2}
                  placeholder="What condition is being treated?"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-700">Medications</h3>
                  <button
                    onClick={addMedication}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm hover:bg-blue-200"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                <div className="space-y-4">
                  {prescriptionData.medications.map((med, idx) => (
                    <div key={idx} className="p-4 border border-slate-200 rounded-lg space-y-3">
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Medicine name"
                          value={med.name}
                          onChange={(e) => updateMedication(idx, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
                        />
                        <button
                          onClick={() => removeMedication(idx)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Dosage (e.g., 500mg)"
                          value={med.dosage}
                          onChange={(e) => updateMedication(idx, 'dosage', e.target.value)}
                          className="px-3 py-2 border border-slate-200 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Frequency (e.g., 3x daily)"
                          value={med.frequency}
                          onChange={(e) => updateMedication(idx, 'frequency', e.target.value)}
                          className="px-3 py-2 border border-slate-200 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Duration (e.g., 7 days)"
                          value={med.duration}
                          onChange={(e) => updateMedication(idx, 'duration', e.target.value)}
                          className="px-3 py-2 border border-slate-200 rounded-lg"
                        />
                        <input
                          type="number"
                          placeholder="Quantity"
                          value={med.quantity}
                          onChange={(e) => updateMedication(idx, 'quantity', e.target.value)}
                          className="px-3 py-2 border border-slate-200 rounded-lg"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Instructions (e.g., Take with food)"
                        value={med.instructions}
                        onChange={(e) => updateMedication(idx, 'instructions', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={prescriptionData.expiryDate}
                  onChange={(e) => handlePrescriptionChange('expiryDate', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={prescriptionData.notes}
                  onChange={(e) => handlePrescriptionChange('notes', e.target.value)}
                  rows={2}
                  placeholder="Any additional notes..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Step 3: Summary */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Appointment Summary</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Patient:</strong> {appointment.patient?.name}</p>
                  <p><strong>Date & Time:</strong> {new Date(appointment.date).toLocaleDateString()} {appointment.time}</p>
                  <p><strong>Reason:</strong> {appointment.reason}</p>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Medical Record Preview</h3>
                <div className="text-sm text-green-800 space-y-1">
                  <p><strong>Chief Complaint:</strong> {medicalData.chiefComplaint}</p>
                  <p><strong>Diagnosis:</strong> {medicalData.diagnosis.filter(d => d).join(', ')}</p>
                  <p><strong>Medications:</strong> {prescriptionData.medications.filter(m => m.name).length} medication(s)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  General Notes for Appointment
                </label>
                <textarea
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  rows={3}
                  placeholder="Any general notes about this appointment..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ✓ Everything looks good! Click "Complete" to save the appointment with medical record and prescription.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 p-6 border-t border-slate-200 bg-white">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Back
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : step === 3 ? 'Complete Appointment' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppointmentCompletionModal;
