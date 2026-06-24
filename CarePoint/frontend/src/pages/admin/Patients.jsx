import { useState, useEffect } from 'react';
import api from '../../api/api';
import MainLayout from '../../layout/MainLayout';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import { Search, UserCheck } from 'lucide-react';
import { toast } from 'react-toastify';

function Patients() {
  const [patientsList, setPatientsList] = useState([]);
  const [search, setSearch] = useState('');
  
  const fetchPatients = async () => {
    try {
      // Get users with role="patient"
      const response = await api.getAllUsers(1, 100, "", "patient");
      const usersArray = response.users || response.data || [];
      setPatientsList(usersArray);
    } catch(error) {
      console.error("Patients fetch error:", error);
      toast.error("Failed to load patients");
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Patients List</h1>
          <p className="text-slate-600">View all registered patients in the system</p>
        </div>
      </div>

      <Card className="mb-6">
        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patientsList.filter((patient) =>
            patient.name.toLowerCase().includes(search.toLowerCase()) || 
            patient.email.toLowerCase().includes(search.toLowerCase())
          )
          .map((patient) => (
          <Card key={patient._id} hover>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {patient.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">{patient.name}</h3>
                  <p className="text-sm text-slate-600">{patient.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Role:</span>
                  <div className="flex items-center gap-1 text-slate-700 font-semibold text-sm">
                    <UserCheck className="w-4 h-4 text-cyan-500" />
                    Patient
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Account Status:</span>
                  <StatusBadge status={patient.isVerified ? "verified" : "pending"} />
                </div>
              </div>
            </div>
          </Card>
        ))}
        {patientsList.length === 0 && (
          <div className="col-span-full py-10 text-center text-slate-500">
            No patients found in the system.
          </div>
        )}
      </div>

    </MainLayout>
  );
}

export default Patients;
