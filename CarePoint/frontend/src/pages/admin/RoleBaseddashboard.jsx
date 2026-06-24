import AdminDashboard from "./Dashboard";
import DoctorDashboard from "../doctor/DoctorDashboard";
import PatientDashboard from "../patient/PatientDashboard";

function RoleBasedDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log(user.role)

  if (!user) return null;

  if (user.role === "admin") return <AdminDashboard />;
  if (user.role === "doctor") return <DoctorDashboard />;
  if (user.role === "patient") return <PatientDashboard />;

  return <div>Unauthorized</div>;
}

export default RoleBasedDashboard;