import { useState, useEffect } from 'react';
import { FileText, Calendar, User, Pill, Heart, Thermometer, Activity, ArrowLeft, Download } from 'lucide-react';
import api from '../../api/api.js'
import { toast } from 'react-toastify';

function PatientMedicalRecords({ onBack }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      const records = await api.getPatientMedicalRecords();
      setRecords(records);
    } catch (error) {
      toast.error('Failed to load medical records');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadPDF = async (record) => {
    try {
      const blob = await api.exportMedicalRecordPDF(record._id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MedicalRecord_${record._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Medical record downloaded successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to download medical record');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">My Medical Records</h1>
        <p className="text-slate-600">View your medical history and records</p>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-2">No Medical Records</h3>
          <p className="text-slate-500">Your medical records will appear here once created by your doctor.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {records.map((record) => (
            <div
              key={record._id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Visit on {formatDate(record.visitDate)}
                    </h3>
                    <p className="text-sm text-slate-600">
                      Dr. {record.doctor?.name} • {record.doctor?.specialization}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadPDF(record)}
                    className="flex items-center gap-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg text-sm font-medium transition"
                    title="Download as PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedRecord(selectedRecord?._id === record._id ? null : record)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {selectedRecord?._id === record._id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              </div>

              {selectedRecord?._id === record._id && (
                <div className="border-t border-slate-200 pt-4 space-y-4">
                  {/* Chief Complaint */}
                  <div>
                    <h4 className="font-medium text-slate-700 mb-2">Chief Complaint</h4>
                    <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">
                      {record.chiefComplaint}
                    </p>
                  </div>

                  {/* Vital Signs */}
                  {record.vitalSigns && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Vital Signs
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {record.vitalSigns.bloodPressure && (
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <div className="text-sm text-slate-600">Blood Pressure</div>
                            <div className="font-medium">{record.vitalSigns.bloodPressure}</div>
                          </div>
                        )}
                        {record.vitalSigns.temperature && (
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <div className="text-sm text-slate-600">Temperature</div>
                            <div className="font-medium">{record.vitalSigns.temperature}°F</div>
                          </div>
                        )}
                        {record.vitalSigns.pulse && (
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <div className="text-sm text-slate-600">Pulse</div>
                            <div className="font-medium">{record.vitalSigns.pulse} bpm</div>
                          </div>
                        )}
                        {record.vitalSigns.weight && (
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <div className="text-sm text-slate-600">Weight</div>
                            <div className="font-medium">{record.vitalSigns.weight} kg</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Diagnosis */}
                  {record.diagnosis && record.diagnosis.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-2">Diagnosis</h4>
                      <div className="flex flex-wrap gap-2">
                        {record.diagnosis.map((diag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                          >
                            {diag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Treatment */}
                  {record.treatment && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-2">Treatment</h4>
                      <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">
                        {record.treatment}
                      </p>
                    </div>
                  )}

                  {/* Medications */}
                  {record.medications && record.medications.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <Pill className="w-4 h-4" />
                        Prescribed Medications
                      </h4>
                      <div className="space-y-2">
                        {record.medications.map((med, index) => (
                          <div key={index} className="bg-slate-50 p-3 rounded-lg">
                            <div className="font-medium text-slate-800">{med.name}</div>
                            <div className="text-sm text-slate-600">
                              {med.dosage} • {med.frequency} • {med.duration}
                            </div>
                            {med.instructions && (
                              <div className="text-sm text-slate-500 mt-1">
                                Instructions: {med.instructions}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up */}
                  {record.followUp && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Follow-up
                      </h4>
                      <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">
                        {record.followUp}
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  {record.notes && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-2">Additional Notes</h4>
                      <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">
                        {record.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PatientMedicalRecords;