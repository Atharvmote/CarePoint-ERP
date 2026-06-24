// src/api/api.js


// Base URL (your backend)
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";


// Get auth headers
const getHeaders = () => {
  const token = localStorage.getItem("authToken");

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};


// Generic API request function
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    // Global 401 handler — token expired mid-session
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
        window.location.href = "/login";
      }
      throw new Error("Session expired. Please log in again.");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.msg || data.error || "API request failed");
    }

    return data;
  } catch (error) {
    // Don't double-log redirect errors
    if (!error.message?.includes("Session expired")) {
      console.error("API Error:", error);
    }
    throw error;
  }
}

// ================================
// AUTH APIs
// ================================

const login = async (credentials) => {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  // store token
  if (data.token) {
    localStorage.setItem("authToken", data.token);
  }

  return data;
};


const register = async (userData) => {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};


const sendOtp = async (email) => {
  return apiRequest("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};


const verifyOtp = async (email, otp) => {
  const data = await apiRequest("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });

  // store token
  if (data.token) {
    localStorage.setItem("authToken", data.token);
  }

  return data;
};


const resendOtp = async (email) => {
  return apiRequest("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

const forgotPassword = async (email) => {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

const resetPassword = async (email, otp, newPassword) => {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, otp, newPassword }),
  });
};

const logout = () => {
  localStorage.removeItem("authToken");
};



// ================================
// DOCTOR APIs
// ================================

const getDoctors = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.specialty) queryParams.append("specialty", params.specialty);
  if (params.status) queryParams.append("status", params.status);
  
  const queryString = queryParams.toString();
  const endpoint = `/doctors${queryString ? `?${queryString}` : ""}`;
  
  return apiRequest(endpoint);
};

const createDoctor = (doctorData) =>
  apiRequest("/doctors", {
    method: "POST",
    body: JSON.stringify(doctorData),
  });

const deleteDoctor = (id) =>
  apiRequest(`/doctors/${id}`, {
    method: "DELETE"
  });

const updateDoctor = (id, data) =>
  apiRequest(`/doctors/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });

const getMyDoctorProfile = () => apiRequest("/doctors/me");

// doctor work status

//start work
const startWork = () =>
  apiRequest("/doctors/start-work", {
    method: "PUT"
  });
  
//end work
const endWork = () =>
  apiRequest("/doctors/end-work", {
    method: "PUT"
  });

// Get patient history for doctor
const getPatientHistory = (patientId) =>
  apiRequest(`/doctors/patient-history/${patientId}`);


// ================================
// INQUIRY APIs
// ================================

const getInquiries = () => apiRequest("/inquiries");

const createInquiry = (inquiryData) =>
  apiRequest("/inquiries", {
    method: "POST",
    body: JSON.stringify(inquiryData),
  });

const updateInquiryStatus = (id, status) =>
  apiRequest(`/inquiries/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });


// ================================
// SLOT APIs
// ================================

const getSlots = (doctorId, date) =>
  apiRequest(`/slots?doctorId=${doctorId}&date=${date}`);

const createSlot = (slotData) =>
  apiRequest("/slots", {
    method: "POST",
    body: JSON.stringify(slotData),
  });

const bookSlot = (slotId, bookingData) =>
  apiRequest(`/slots/${slotId}/book`, {
    method: "POST",
    body: JSON.stringify(bookingData),
  });


// ================================
// RESOURCE APIs
// ================================

const getResources = () => apiRequest("/resources");

const createResource = (resourceData) =>
  apiRequest("/resources", {
    method: "POST",
    body: JSON.stringify(resourceData),
  });

const updateResourceAvailability = (id, available) =>
  apiRequest(`/resources/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ available }),
  });



// ================================
// DASHBOARD APIs
// ================================

const getDashboardStats = () =>
  apiRequest("/dashboard/emergency");

//doctor dashboard api....
const getDoctorDashboard = () =>
  apiRequest("/doctors/dashboard");



//=================================
//Appoinments api
//=================================

const getDoctorAppointments = () =>
  apiRequest("/appointments/doctor");

const getPatientAppointments = () =>
  apiRequest("/appointments/patient");

const createAppointment = (data) =>
  apiRequest("/appointments", {
    method: "POST",
    body: JSON.stringify(data),
  });

const startAppointment = (id) =>
  apiRequest(`/appointments/${id}/start`, {
    method: "PUT"
  });

const completeAppointment = (id, data = {}) =>
  apiRequest(`/appointments/${id}/complete`, {
    method: "PUT",
    body: JSON.stringify(data)
  });

  const cancelAppointment = (id) =>
  apiRequest(`/appointments/${id}/cancel`, {
    method: "PUT"
  });

const markAppointmentEmergency = (id, reason) =>
  apiRequest(`/appointments/${id}/emergency`, {
    method: "PUT",
    body: JSON.stringify({ emergencyReason: reason })
  });

const getEmergencyAppointments = () =>
  apiRequest("/appointments/emergency/all", {
    method: "GET"
  });

// ================================
// Export all APIs
// ================================

export const api = {
  // auth
  login,
  register,
  sendOtp,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  logout,
  updatePassword: (data) =>
    apiRequest(`/auth/update-password`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // doctors
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getMyDoctorProfile,
  getPatientHistory,

  // inquiries
  getInquiries,
  createInquiry,
  updateInquiryStatus,

  // slots
  getSlots,
  createSlot,
  bookSlot,

  // resources
  getResources,
  createResource,
  updateResourceAvailability,

  //work start end
  startWork,
  endWork,

  // dashboard
  getDashboardStats,
  getDoctorDashboard,

  //apoinments api
  getDoctorAppointments,
  getPatientAppointments,
  startAppointment,
  completeAppointment,
  createAppointment,
  cancelAppointment,
  markAppointmentEmergency,
  getEmergencyAppointments,

  // medical records
  createMedicalRecord: (data) =>
    apiRequest("/medical-records", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getPatientMedicalRecords: () => apiRequest("/medical-records/patient"),
  getMedicalRecordsForDoctor: (patientId) => apiRequest(`/medical-records/doctor/${patientId}`),
  updateMedicalRecord: (id, data) =>
    apiRequest(`/medical-records/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteMedicalRecord: (id) =>
    apiRequest(`/medical-records/${id}`, {
      method: "DELETE",
    }),
  exportMedicalRecordPDF: (id) =>
    fetch(`${API_BASE_URL}/medical-records/${id}/export`, {
      headers: getHeaders()
    }).then(res => res.blob()),

  // prescriptions
  createPrescription: (data) =>
    apiRequest("/prescriptions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getPatientPrescriptions: () => apiRequest("/prescriptions/patient"),
  getPrescriptionsForDoctor: (patientId) => apiRequest(`/prescriptions/doctor/${patientId}`),
  updatePrescription: (id, data) =>
    apiRequest(`/prescriptions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  markPrescriptionDispensed: (id) =>
    apiRequest(`/prescriptions/${id}/dispense`, {
      method: "PUT",
    }),
  deletePrescription: (id) =>
    apiRequest(`/prescriptions/${id}`, {
      method: "DELETE",
    }),
  exportPrescriptionPDF: (id) =>
    fetch(`${API_BASE_URL}/prescriptions/${id}/export`, {
      headers: getHeaders()
    }).then(res => res.blob()),

  // ratings
  createRating: (data) =>
    apiRequest("/ratings", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getDoctorRatings: (doctorId) =>
    apiRequest(`/ratings/doctor/${doctorId}`),
  getAppointmentRating: (appointmentId) =>
    apiRequest(`/ratings/appointment/${appointmentId}`),
  getPatientRatings: () =>
    apiRequest("/ratings/patient/my-ratings"),
  updateRating: (id, data) =>
    apiRequest(`/ratings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteRating: (id) =>
    apiRequest(`/ratings/${id}`, {
      method: "DELETE",
    }),

  // schedule
  getMySchedule: () => apiRequest("/schedule", { method: "GET" }),
  getDoctorSchedule: (doctorId) =>
    apiRequest(`/schedule/${doctorId}`, { method: "GET" }),
  createOrUpdateSchedule: (data) =>
    apiRequest("/schedule", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  addBlockedDate: (data) =>
    apiRequest("/schedule/blocked-date", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  removeBlockedDate: (blockedDateId) =>
    apiRequest(`/schedule/blocked-date/${blockedDateId}`, {
      method: "DELETE",
    }),
  addBreak: (data) =>
    apiRequest("/schedule/break", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  removeBreak: (breakId) =>
    apiRequest(`/schedule/break/${breakId}`, {
      method: "DELETE",
    }),

  // admin
  getAllUsers: (page = 1, limit = 10, search = "", role = "", status = "") =>
    apiRequest(`/admin/users?page=${page}&limit=${limit}&search=${search}&role=${role}&status=${status}`),
  createStaff: (data) =>
    apiRequest("/admin/staff", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateUser: (id, data) =>
    apiRequest(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteUser: (id) =>
    apiRequest(`/admin/users/${id}`, {
      method: "DELETE",
    }),
  getAllAppointments: (page = 1, limit = 10, status = "", doctor = "", patient = "", date = "") =>
    apiRequest(`/admin/appointments?page=${page}&limit=${limit}&status=${status}&doctor=${doctor}&patient=${patient}&date=${date}`),
  rescheduleAppointment: (id, data) =>
    apiRequest(`/admin/appointments/${id}/reschedule`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  reassignAppointment: (id, newDoctorId) =>
    apiRequest(`/admin/appointments/${id}/reassign`, {
      method: "PUT",
      body: JSON.stringify({ newDoctorId }),
    }),
  getAdminAnalytics: () =>
    apiRequest("/admin/analytics"),
  getSystemHealth: () =>
    apiRequest("/admin/health"),

  // notifications
  getNotifications: () => apiRequest("/notifications"),
  markNotificationRead: (id) =>
    apiRequest(`/notifications/${id}/read`, {
      method: "PUT",
    }),
  clearNotifications: () =>
    apiRequest("/notifications", {
      method: "DELETE",
    }),
};


export default api;
