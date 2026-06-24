import { useState, useEffect } from 'react';
import { FileText, Heart, Activity, Calendar } from 'lucide-react';
import api from '../../api/api.js'
import { toast } from 'react-toastify';

function MedicalRecordModal({ isOpen, onClose, appointment, patient }) {
  const [activeTab, setActiveTab] = useState('history');
  const [formData, setFormData] = useState({
    medicalHistory: {
      pastConditions: [],
      surgeries: [],
      allergies: [],
      medications: [],
      familyHistory: []
    },
    symptoms: [],
    diagnosis: '',
    treatment: '',
    notes: '',
    vitalSigns: {
      bloodPressure: '',
      temperature: '',
      heartRate: '',
      weight: '',
      height: '',
      bmi: ''
    },
    labResults: [],
    followUpDate: '',
    followUpNotes: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (appointment && patient) {
      // Load existing medical records for this patient
      loadExistingRecords();
    }
  }, [appointment, patient]);

  const loadExistingRecords = async () => {
    try {
      const records = await api.getMedicalRecordsForDoctor(patient._id);
      if (records.length > 0) {
        const latestRecord = records[0]; // Most recent
        setFormData({
          medicalHistory: latestRecord.medicalHistory || formData.medicalHistory,
          symptoms: latestRecord.symptoms || [],
          diagnosis: latestRecord.diagnosis || '',
          treatment: latestRecord.treatment || '',
          notes: latestRecord.notes || '',
          vitalSigns: latestRecord.vitalSigns || formData.vitalSigns,
          labResults: latestRecord.labResults || [],
          followUpDate: latestRecord.followUpDate ? latestRecord.followUpDate.split('T')[0] : '',
          followUpNotes: latestRecord.followUpNotes || ''
        });
      }
    } catch (error) {
      console.error('Error loading medical records:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.createMedicalRecord({
        appointmentId: appointment._id,
        ...formData
      });

      toast.success('Medical record saved successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to save medical record');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const addArrayItem = (path, value) => {
    if (value.trim()) {
      setFormData(prev => {
        const keys = path.split('.');
        const updateNested = (obj, keys, val) => {
          if (keys.length === 1) {
            return { ...obj, [keys[0]]: [...obj[keys[0]], val] };
          } else {
            return { ...obj, [keys[0]]: updateNested(obj[keys[0]], keys.slice(1), val) };
          }
        };
        return updateNested(prev, keys, value.trim());
      });
    }
  };

  const removeArrayItem = (path, index) => {
    setFormData(prev => {
      const keys = path.split('.');
      const updateNested = (obj, keys, idx) => {
        if (keys.length === 1) {
          return { ...obj, [keys[0]]: obj[keys[0]].filter((_, i) => i !== idx) };
        } else {
          return { ...obj, [keys[0]]: updateNested(obj[keys[0]], keys.slice(1), idx) };
        }
      };
      return updateNested(prev, keys, index);
    });
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        medications: [...prev.medicalHistory.medications, { name: '', dosage: '', frequency: '', duration: '' }]
      }
    }));
  };

  const updateMedication = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        medications: prev.medicalHistory.medications.map((med, i) =>
          i === index ? { ...med, [field]: value } : med
        )
      }
    }));
  };

  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        medications: prev.medicalHistory.medications.filter((_, i) => i !== index)
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Medical Record</h2>
            <p className="text-sm text-slate-600">
              {patient?.name} • {appointment?.date} {appointment?.time}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0">
          {/* Sidebar Tabs */}
          <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto">
            <div className="space-y-2">
              {[
                { id: 'history', label: 'Medical History', icon: FileText },
                { id: 'vitals', label: 'Vital Signs', icon: Heart },
                { id: 'current', label: 'Current Visit', icon: Activity },
                { id: 'followup', label: 'Follow-up', icon: Calendar }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto min-h-0">
            {/* Medical History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800">Medical History</h3>

                {/* Past Conditions */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Past Conditions
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add condition..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem('medicalHistory.pastConditions', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.target.previousElementSibling;
                        addArrayItem('medicalHistory.pastConditions', input.value);
                        input.value = '';
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.medicalHistory.pastConditions.map((condition, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                        {condition}
                        <button
                          type="button"
                          onClick={() => removeArrayItem('medicalHistory.pastConditions', index)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Current Medications */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Current Medications
                  </label>
                  {formData.medicalHistory.medications.map((med, index) => (
                    <div key={index} className="grid grid-cols-5 gap-2 mb-2 p-3 border border-slate-200 rounded-lg">
                      <input
                        type="text"
                        placeholder="Name"
                        value={med.name}
                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                        className="px-2 py-1 border border-slate-300 rounded text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Dosage"
                        value={med.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        className="px-2 py-1 border border-slate-300 rounded text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Frequency"
                        value={med.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        className="px-2 py-1 border border-slate-300 rounded text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Duration"
                        value={med.duration}
                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                        className="px-2 py-1 border border-slate-300 rounded text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addMedication}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Add Medication
                  </button>
                </div>
              </div>
            )}

            {/* Vital Signs Tab */}
            {activeTab === 'vitals' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800">Vital Signs</h3>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Blood Pressure
                    </label>
                    <input
                      type="text"
                      placeholder="120/80 mmHg"
                      value={formData.vitalSigns.bloodPressure}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        vitalSigns: { ...prev.vitalSigns, bloodPressure: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Temperature
                    </label>
                    <input
                      type="text"
                      placeholder="98.6°F"
                      value={formData.vitalSigns.temperature}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        vitalSigns: { ...prev.vitalSigns, temperature: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Heart Rate
                    </label>
                    <input
                      type="text"
                      placeholder="72 bpm"
                      value={formData.vitalSigns.heartRate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        vitalSigns: { ...prev.vitalSigns, heartRate: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Weight
                    </label>
                    <input
                      type="text"
                      placeholder="70 kg"
                      value={formData.vitalSigns.weight}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        vitalSigns: { ...prev.vitalSigns, weight: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Current Visit Tab */}
            {activeTab === 'current' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800">Current Visit</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Symptoms
                  </label>
                  <textarea
                    placeholder="Describe patient's symptoms..."
                    value={formData.symptoms.join(', ')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      symptoms: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Diagnosis
                  </label>
                  <textarea
                    placeholder="Medical diagnosis..."
                    value={formData.diagnosis}
                    onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Treatment Plan
                  </label>
                  <textarea
                    placeholder="Treatment recommendations..."
                    value={formData.treatment}
                    onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    placeholder="Additional observations..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                  />
                </div>
              </div>
            )}

            {/* Follow-up Tab */}
            {activeTab === 'followup' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800">Follow-up</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Follow-up Notes
                  </label>
                  <textarea
                    placeholder="Follow-up instructions..."
                    value={formData.followUpNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, followUpNotes: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MedicalRecordModal;