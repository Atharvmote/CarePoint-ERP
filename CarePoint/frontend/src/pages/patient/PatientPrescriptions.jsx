import { useState, useEffect } from 'react';
import { Pill, Calendar, Clock, Download, Eye, ArrowLeft } from 'lucide-react';
import api from '../../api/api.js';
import { toast } from 'react-toastify';

function PatientPrescriptions({ onBack }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const prescriptions = await api.getPatientPrescriptions();
      setPrescriptions(prescriptions);
    } catch (error) {
      toast.error('Failed to load prescriptions');
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

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  const getStatusColor = (status, expiryDate) => {
    if (isExpired(expiryDate)) return 'bg-red-100 text-red-700';
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'dispensed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const handleDownloadPDF = async (prescription) => {
    try {
      const blob = await api.exportPrescriptionPDF(prescription._id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Prescription_${prescription._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Prescription downloaded successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to download prescription');
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
        <h1 className="text-2xl font-bold text-slate-800 mb-2">My Prescriptions</h1>
        <p className="text-slate-600">View and manage your prescriptions</p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="text-center py-12">
          <Pill className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-2">No Prescriptions</h3>
          <p className="text-slate-500">Your prescriptions will appear here once prescribed by your doctor.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {prescriptions.map((prescription) => (
            <div
              key={prescription._id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Pill className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Prescription #{prescription._id.slice(-8)}
                    </h3>
                    <p className="text-sm text-slate-600">
                      Dr. {prescription.doctor?.name} • {formatDate(prescription.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status, prescription.expiryDate)}`}>
                    {isExpired(prescription.expiryDate) ? 'Expired' : prescription.status}
                  </span>
                  <button
                    onClick={() => handleDownloadPDF(prescription)}
                    className="flex items-center gap-2 px-2 py-1 text-green-600 hover:bg-green-50 rounded-lg text-sm font-medium transition"
                    title="Download as PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedPrescription(selectedPrescription?._id === prescription._id ? null : prescription)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {selectedPrescription?._id === prescription._id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              </div>

              {selectedPrescription?._id === prescription._id && (
                <div className="border-t border-slate-200 pt-4 space-y-4">
                  {/* Diagnosis */}
                  {prescription.diagnosis && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-2">Diagnosis</h4>
                      <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">
                        {prescription.diagnosis}
                      </p>
                    </div>
                  )}

                  {/* Medications */}
                  <div>
                    <h4 className="font-medium text-slate-700 mb-2">Medications</h4>
                    <div className="space-y-3">
                      {prescription.medications.map((med, index) => (
                        <div key={index} className="bg-slate-50 p-4 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h5 className="font-medium text-slate-800">{med.name}</h5>
                              <p className="text-sm text-slate-600">
                                {med.dosage} • {med.frequency} • {med.duration}
                              </p>
                            </div>
                            <span className="text-sm text-slate-500">
                              Qty: {med.quantity}
                            </span>
                          </div>
                          {med.instructions && (
                            <p className="text-sm text-slate-600 mt-2">
                              <strong>Instructions:</strong> {med.instructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prescription Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-slate-700 mb-2">Prescription Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Date Issued:</span>
                          <span className="font-medium">{formatDate(prescription.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Valid Until:</span>
                          <span className={`font-medium ${isExpired(prescription.expiryDate) ? 'text-red-600' : 'text-green-600'}`}>
                            {formatDate(prescription.expiryDate)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Status:</span>
                          <span className="font-medium capitalize">{prescription.status}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-700 mb-2">Doctor Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Name:</span>
                          <span className="font-medium">Dr. {prescription.doctor?.name}</span>
                        </div>
                        {prescription.doctor?.specialization && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Specialization:</span>
                            <span className="font-medium">{prescription.doctor.specialization}</span>
                          </div>
                        )}
                        {prescription.doctor?.licenseNumber && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">License:</span>
                            <span className="font-medium">{prescription.doctor.licenseNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {prescription.notes && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-2">Additional Notes</h4>
                      <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">
                        {prescription.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">
                      <Eye className="w-4 h-4" />
                      View Full Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PatientPrescriptions;