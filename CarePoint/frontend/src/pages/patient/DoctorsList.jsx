import { useState, useEffect, useCallback, useMemo, memo } from "react";
import PatientSidebar from "./PatientSidebar";
import PatientNavbar from "./PatientNavbar";
import { Search, Filter, Star, Calendar, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api.js";
import { toast } from "react-toastify";
import { useDebouncedApi } from "../../hooks/useApiOptimization.js";
import { useDoctorStatusUpdates } from "../../hooks/useDoctorStatusUpdates.js";
import Loader from "../../components/common/Loader.jsx";

// Memoized Doctor Card component to prevent unnecessary re-renders
const DoctorCard = memo(({ doctor, onBook }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
    {/* Doctor Header */}
    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-2xl font-bold relative">
          {doctor.user?.name?.charAt(0) || "D"}
          <div
            className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white ${
              doctor.status === "online"
                ? "bg-green-400"
                : doctor.status === "busy"
                ? "bg-yellow-400"
                : "bg-gray-400"
            }`}
          ></div>
        </div>
        <div>
          <h3 className="text-xl font-bold">{doctor.user.name}</h3>
          <p className="text-blue-100 text-sm">{doctor.qualification}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 bg-white/20 backdrop-blur-xl rounded-full text-sm font-semibold">
          {doctor.specialty}
        </span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            doctor.status === "online"
              ? "bg-green-500 text-white"
              : doctor.status === "busy"
              ? "bg-yellow-500 text-white"
              : "bg-gray-500 text-white"
          }`}
        >
          {doctor.status === "online"
            ? "🟢 Online"
            : doctor.status === "busy"
            ? "🟡 Busy"
            : "🔴 Offline"}
        </span>
      </div>
    </div>

    {/* Doctor Details */}
    <div className="p-6">
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Rating</span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-slate-800">{doctor.rating || "N/A"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Experience</span>
          <span className="text-sm font-semibold text-slate-800">{doctor.experience}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Consultation Fee</span>
          <span className="text-sm font-semibold text-blue-600">₹{doctor.fee}</span>
        </div>
      </div>

      {/* Book Button */}
      <button
        onClick={() => onBook(doctor._id)}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/30"
      >
        Book Appointment
      </button>
    </div>
  </div>
));

DoctorCard.displayName = "DoctorCard";

function DoctorsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);

  const ITEMS_PER_PAGE = 9; // 3x3 grid

  // 🔄 Enable real-time doctor status updates
  useDoctorStatusUpdates(doctors, setDoctors, user?._id);

  // Debounced search API call
  const { debouncedCall: debouncedFetch } = useDebouncedApi(
    async (page, specialty) => {
      setLoading(true);
      try {
        const response = await api.getDoctors({
          page,
          limit: ITEMS_PER_PAGE,
          specialty: specialty !== "all" ? specialty : undefined
        });
        setDoctors(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalDocs(response.pagination?.totalDocs || 0);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching doctors", error);
        toast.error("Failed to load doctors");
        setLoading(false);
      }
    },
    300 // Debounce delay
  );

  // Fetch doctors on component mount and when filters change
  useEffect(() => {
    setCurrentPage(1);
    debouncedFetch(1, selectedSpecialty);
  }, [selectedSpecialty]);

  // Fetch on page change
  useEffect(() => {
    debouncedFetch(currentPage, selectedSpecialty);
  }, [currentPage]);

  // Handle booking
  const handleBook = useCallback(
    (doctorId) => {
      navigate(`/patient/book-appointment/${doctorId}`);
    },
    [navigate]
  );

  // Handle search with client-side filtering for better UX
  const filteredDoctors = useMemo(() => {
    if (!searchQuery.trim()) return doctors;
    
    return doctors.filter(
      (doctor) =>
        doctor.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [doctors, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <PatientSidebar />

      <div className="ml-64">
        <PatientNavbar patientName={user?.name} />

        <main className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Find Doctors</h1>
            <p className="text-slate-600">
              Browse our expert medical professionals (Showing {filteredDoctors.length} of {totalDocs})
            </p>
          </div>

          {/* Search & Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by doctor name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Specialty Filter */}
              <div className="md:w-64">
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="all">All Specialties</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="General Physician">General Physician</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Orthopedic">Orthopedic</option>
                    <option value="Pediatrician">Pediatrician</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center min-h-96">
              <Loader />
            </div>
          )}

          {/* Doctors Grid */}
          {!loading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredDoctors.map((doctor) => (
                  <DoctorCard
                    key={doctor._id}
                    doctor={doctor}
                    onBook={handleBook}
                  />
                ))}
              </div>

              {/* No Results */}
              {filteredDoctors.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p className="text-slate-600 font-medium">No doctors found</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button
                        key={idx + 1}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === idx + 1
                            ? "bg-blue-600 text-white"
                            : "border border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default DoctorsList;
