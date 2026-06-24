import { useState, useEffect } from 'react';
import { AlertCircle, Activity, FileText, Pill, TrendingDown } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/api';

function PatientHistoryPanel({ patientId, patientName }) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPatientHistory();
  }, [patientId]);

  const fetchPatientHistory = async () => {
    try {
      const data = await api.getPatientHistory(patientId);
      setHistory(data);
    } catch (err) {
      toast.error('Failed to load patient history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="p-8 text-center text-slate-600">
        Unable to load patient history
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <h2 className="text-2xl font-bold text-slate-800">Patient History</h2>
        <p className="text-slate-600 mt-1">{patientName}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        {[
          { id: 'overview', label: 'Overview', icon: '📋' },
          { id: 'records', label: 'Medical Records', icon: '📄' },
          { id: 'prescriptions', label: 'Prescriptions', icon: '💊' },
          { id: 'vitals', label: 'Vitals Trends', icon: '📊' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Allergies/Chronic Conditions Alert */}
            {history.chronicConditions && history.chronicConditions.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-2">⚠️ Chronic Conditions</h3>
                    <div className="flex flex-wrap gap-2">
                      {history.chronicConditions.map((condition, idx) => (
                        <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-600 font-semibold">Total Appointments</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{history.appointmentCount}</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600 font-semibold">Medical Records</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{history.recordCount}</p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-600 font-semibold">Prescriptions</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">{history.prescriptionCount}</p>
              </div>
            </div>

            {/* Patient Info */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h3 className="font-semibold text-slate-800 mb-3">Patient Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-slate-600">Email:</span> <span className="font-medium">{history.patient?.email}</span></p>
                <p><span className="text-slate-600">Phone:</span> <span className="font-medium">{history.patient?.phone || 'Not provided'}</span></p>
              </div>
            </div>

            {/* Recent Appointments */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Recent Appointments</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.appointments.slice(0, 5).map((apt, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                    <p className="font-medium">Dr. {apt.doctor?.user?.name || 'Unknown'}</p>
                    <p className="text-slate-600">{new Date(apt.date).toLocaleDateString()} at {apt.time}</p>
                    <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-semibold ${
                      apt.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Medical Records Tab */}
        {activeTab === 'records' && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.medicalRecords.length > 0 ? (
              history.medicalRecords.map((record, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-800">
                      Visit: {new Date(record.createdAt).toLocaleDateString()}
                    </h4>
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  {record.chiefComplaint && (
                    <p className="text-sm text-slate-600 mb-2"><strong>Chief Complaint:</strong> {record.chiefComplaint}</p>
                  )}
                  {record.diagnosis && (
                    <p className="text-sm text-slate-600 mb-2"><strong>Diagnosis:</strong> {
                      Array.isArray(record.diagnosis) ? record.diagnosis.join(', ') : record.diagnosis
                    }</p>
                  )}
                  {record.treatment && (
                    <p className="text-sm text-slate-600"><strong>Treatment:</strong> {record.treatment}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-8">No medical records found</p>
            )}
          </div>
        )}

        {/* Prescriptions Tab */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.prescriptions.length > 0 ? (
              history.prescriptions.map((rx, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-800">
                      Rx #{rx._id.slice(-6)}: {new Date(rx.createdAt).toLocaleDateString()}
                    </h4>
                    <Pill className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-sm space-y-2">
                    {rx.medications && rx.medications.length > 0 && (
                      <div>
                        <strong>Medications:</strong>
                        {rx.medications.map((med, i) => (
                          <div key={i} className="text-slate-600 ml-4">
                            • {med.name} - {med.dosage} ({med.frequency})
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-slate-600">
                      <strong>Status:</strong> {rx.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-8">No prescriptions found</p>
            )}
          </div>
        )}

        {/* Vitals Trends Tab */}
        {activeTab === 'vitals' && (
          <div className="space-y-4">
            {history.vitalsTrends && history.vitalsTrends.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.vitalsTrends.map((vital, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      {new Date(vital.date).toLocaleDateString()}
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {vital.bloodPressure && (
                        <div>
                          <p className="text-slate-600">Blood Pressure</p>
                          <p className="font-semibold">{vital.bloodPressure}</p>
                        </div>
                      )}
                      {vital.temperature && (
                        <div>
                          <p className="text-slate-600">Temperature</p>
                          <p className="font-semibold">{vital.temperature}°F</p>
                        </div>
                      )}
                      {vital.pulse && (
                        <div>
                          <p className="text-slate-600">Pulse</p>
                          <p className="font-semibold">{vital.pulse} bpm</p>
                        </div>
                      )}
                      {vital.weight && (
                        <div>
                          <p className="text-slate-600">Weight</p>
                          <p className="font-semibold">{vital.weight} kg</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-8">No vital signs recorded</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientHistoryPanel;
