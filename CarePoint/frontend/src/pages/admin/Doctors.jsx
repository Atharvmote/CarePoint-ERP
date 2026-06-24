import { useState, useEffect } from 'react';
import api from '../../api/api';
import MainLayout from '../../layout/MainLayout';
import { Plus, Search, Star, Edit2, Trash2, Activity, Clock, ShieldCheck, User } from 'lucide-react';
import AddDoctorModal from "../../components/admin/AddDocComponent";
import { toast } from 'react-toastify';

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  
  const fetchDoctors = async () => {
    try {
      const response = await api.getDoctors();
      const doctorsArray = response.data || response; // Backend returns { data: [...], pagination: {...} }
      const formatted = doctorsArray.map(doc => ({
        id: doc._id,
        name: doc.user?.name || "Unknown",
        specialty: doc.specialty || "General",
        experience: doc.experience || "N/A",
        rating: doc.rating || 4.5,
        patients: doc.patients || 0,
        status: doc.status || "offline"
      }));
      setDoctors(formatted);

    } catch(error) {
      console.error("Doctor fetch error:", error);
      toast.error("Failed to load doctors");
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <MainLayout>
        {/* PREMIUM HEADER */}
        <div className="relative mb-10 bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          {/* Abstract Background Blur */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-cyan-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
                <ShieldCheck className="w-4 h-4" /> Administration
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Doctor Management</h1>
              <p className="text-slate-500 text-lg font-medium">Oversee your medical staff, specializations, and availability.</p>
            </div>
            
            <button 
              onClick={() => setShowModal(true)} 
              className="group relative flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold text-sm rounded-2xl hover:bg-blue-600 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_40px_rgba(37,99,235,0.3)] hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
              <Plus className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Add New Doctor</span>
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="mb-8 relative max-w-2xl group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="w-6 h-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by doctor name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all text-lg"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1">
             <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500">⌘</kbd>
             <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500">K</kbd>
          </div>
        </div>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group flex flex-col relative overflow-hidden">
              
              {/* Top Gradient Accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
              
              <div className="p-6 relative">
                {/* Actions (Edit / Delete) */}
                <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0">
                   <button 
                    onClick={async () => {
                      const name = prompt("Enter new name", doctor.name);
                      if (!name) return;
                      await api.updateDoctor(doctor.id, { name });
                      fetchDoctors();
                    }}
                    className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                    title="Edit"
                   >
                     <Edit2 className="w-4 h-4" />
                   </button>
                   <button 
                    onClick={async () => {
                      if (!confirm(`Are you sure you want to delete ${doctor.name}?`)) return;
                      await api.deleteDoctor(doctor.id);
                      fetchDoctors();
                    }}
                    className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                    title="Delete"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>

                {/* Profile Section */}
                <div className="flex items-center gap-5 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center text-blue-600 font-black text-2xl shadow-inner border border-white">
                      {doctor.name.charAt(0).toUpperCase()}
                    </div>
                    {/* Status Indicator */}
                    <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${doctor.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                       <div className={`w-2 h-2 rounded-full bg-white ${doctor.status === 'online' ? 'animate-ping opacity-50' : ''}`}></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors pr-16">{doctor.name}</h3>
                    <p className="text-sm font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full inline-flex">{doctor.specialty}</p>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                   <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                     <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                       <Clock className="w-4 h-4" /> Exp.
                     </div>
                     <div className="text-lg font-black text-slate-800">{doctor.experience} <span className="text-sm font-semibold text-slate-500">Yrs</span></div>
                   </div>
                   <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100/50">
                     <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">
                       <Star className="w-4 h-4 fill-amber-500" /> Rating
                     </div>
                     <div className="text-lg font-black text-slate-800">{doctor.rating} <span className="text-sm font-semibold text-slate-500">/5</span></div>
                   </div>
                </div>

                {/* Footer Details */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                   <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                         <Activity className="w-4 h-4" />
                      </div>
                      {doctor.patients}+ Patients
                   </div>
                   <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                     Status: 
                     <span className={`ml-1 px-2.5 py-1 rounded-lg text-xs uppercase tracking-widest ${doctor.status === 'online' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                       {doctor.status}
                     </span>
                   </div>
                </div>

              </div>
            </div>
          ))}

          {filteredDoctors.length === 0 && (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
                 <User className="w-10 h-10" />
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-2">No doctors found</h3>
               <p className="text-slate-500 max-w-sm">We couldn't find any doctors matching your search criteria. Try adjusting your search term.</p>
            </div>
          )}
        </div>
      </MainLayout>

      <AddDoctorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchDoctors}
      />
    </>
  );
}

export default Doctors;
