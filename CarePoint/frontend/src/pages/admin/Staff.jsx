import { useState, useEffect } from 'react';
import api from '../../api/api';
import MainLayout from '../../layout/MainLayout';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import { Plus, Search, ShieldCheck } from 'lucide-react';
import AddStaffModal from "../../components/admin/AddStaffModal";
import { toast } from 'react-toastify';

function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  
  const fetchStaff = async () => {
    try {
      // Get users with role="staff"
      const response = await api.getAllUsers(1, 100, "", "staff");
      const usersArray = response.users || response.data || [];
      setStaffList(usersArray);
    } catch(error) {
      console.error("Staff fetch error:", error);
      toast.error("Failed to load staff");
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return (
    <>
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Staff Management</h1>
          <p className="text-slate-600">Manage hospital staff accounts</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 shadow-lg">
          <Plus className="w-5 h-5" />
          Add Staff
        </button>
      </div>

      <Card className="mb-6">
        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffList.filter((staff) =>
            staff.name.toLowerCase().includes(search.toLowerCase()) || 
            staff.email.toLowerCase().includes(search.toLowerCase())
          )
          .map((staff) => (
          <Card key={staff._id} hover>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {staff.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">{staff.name}</h3>
                  <p className="text-sm text-slate-600">{staff.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Role:</span>
                  <div className="flex items-center gap-1 text-slate-700 font-semibold text-sm">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    Staff
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Status:</span>
                  <StatusBadge status={staff.status || "active"} />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                    onClick={async () => {
                      if (!confirm(`Delete staff member ${staff.name}?`)) return;
                      await api.deleteUser(staff._id);
                      toast.success("Staff deleted");
                      fetchStaff();
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded w-full hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
            </div>
          </Card>
        ))}
        {staffList.length === 0 && (
          <div className="col-span-full py-10 text-center text-slate-500">
            No staff members found. Add one to get started.
          </div>
        )}
      </div>

      </MainLayout>

      <AddStaffModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchStaff}
        />
    </>
  );
}

export default Staff;
