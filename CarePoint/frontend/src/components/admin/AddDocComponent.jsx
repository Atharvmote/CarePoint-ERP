import { useState } from "react";
import api from "../../api/api";
import { toast } from 'react-toastify';

function AddDoctorModal({ isOpen, onClose, onSuccess }) {

  const specialties = [
    "Cardiologist",
    "Orthopedic",
    "Dermatologist",
    "Neurologist",
    "Pediatrician",
    "Gynecologist",
    "General Physician",
    "Psychiatrist"
  ];

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",          // ✅ Added
    phone: "",
    specialty: "",
    experience: "",
    qualification: "",
    fee: "",
    status: "offline"      // ✅ Updated
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {

    if (!form.name || !form.email || !form.password || !form.specialty) {
      toast.error("Please fill all required fields");
      return;
    }

    try {

      await api.createDoctor({
        ...form,
        fee: Number(form.fee)  // ✅ Ensure number
      });

      onSuccess();
      onClose();

      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        specialty: "",
        experience: "",
        qualification: "",
        fee: "",
        status: "offline"
      });

    } catch (error) {
      toast.error("Failed to add doctor");
    }
  };

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white p-6 rounded-xl w-[500px] shadow-lg">

        <h2 className="text-xl font-bold mb-4">
          Add New Doctor
        </h2>

        <div className="grid grid-cols-2 gap-3">

          <input
            name="name"
            placeholder="Doctor Name"
            value={form.name}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          {/* ✅ Password Field */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            name="phone"
            placeholder="Phone"
            maxLength={10}
            value={form.phone}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          {/* ✅ Specialty Dropdown */}
          <select
            name="specialty"
            value={form.specialty}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">Select Specialty</option>
            {specialties.map((spec, index) => (
              <option key={index} value={spec}>
                {spec}
              </option>
            ))}
          </select>

          <input
            name="experience"
            placeholder="Experience (years)"
            value={form.experience}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            name="qualification"
            placeholder="Qualification"
            value={form.qualification}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            name="fee"
            placeholder="Consultation Fee"
            value={form.fee}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          {/* ✅ Correct Status Values */}
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="offline">Offline</option>
            <option value="online">Online</option>
            <option value="busy">Busy</option>
          </select>

        </div>

        <div className="flex justify-end gap-3 mt-5">

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save Doctor
          </button>

        </div>
      </div>
    </div>
  );
}

export default AddDoctorModal;