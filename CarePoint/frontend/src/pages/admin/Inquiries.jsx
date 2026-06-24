import { useState, useEffect } from 'react';
import api from '../../api/api';
import MainLayout from '../../layout/MainLayout';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import { Plus, Search } from 'lucide-react';
import { toast } from 'react-toastify';

function Inquiries() {
const [inquiries, setInquiries] = useState([]);
useEffect(() => {

  const fetchInquiries = async () => {

    try {
      const data = await api.getInquiries();
      const formatted = data.map(item => ({
        id: item._id,
        patientName: item.patientName,
        inquiry: item.message || item.inquiry,
        date: new Date(item.createdAt).toISOString().split('T')[0],
        status: item.status || "pending"
      }));

      setInquiries(formatted);

    } catch(error) {
      console.error("Inquiry fetch error:", error);
      toast.error("Failed to load inquiries");
    }
  };
  fetchInquiries();
}, []);


  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Inquiry Management</h1>
          <p className="text-slate-600">Manage patient inquiries</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 shadow-lg">
          <Plus className="w-5 h-5" />
          New Inquiry
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Inquiry</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{inquiry.patientName}</td>
                  <td className="px-6 py-4 text-slate-600">{inquiry.inquiry}</td>
                  <td className="px-6 py-4 text-slate-600">{inquiry.date}</td>
                  <td className="px-6 py-4"><StatusBadge status={inquiry.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </MainLayout>
  );
}

export default Inquiries;
