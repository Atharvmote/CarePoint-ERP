import { useState } from "react";
import api from "../../api/api";
import { toast } from 'react-toastify';

function AddStaffModal({ isOpen, onClose, onSuccess }) {

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {

    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill all required fields");
      return;
    }

    try {

      await api.createStaff(form);

      toast.success("Staff added successfully!");
      onSuccess();
      onClose();

      setForm({
        name: "",
        email: "",
        password: ""
      });

    } catch (error) {
      toast.error(error.message || "Failed to add staff");
    }
  };

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white p-6 rounded-xl w-[400px] shadow-lg">

        <h2 className="text-xl font-bold mb-4">
          Add New Staff
        </h2>

        <div className="grid grid-cols-1 gap-3">

          <input
            name="name"
            placeholder="Staff Name"
            value={form.name}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            name="email"
            placeholder="Email (ID)"
            value={form.email}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="border p-2 rounded"
          />

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
            Save Staff
          </button>

        </div>
      </div>
    </div>
  );
}

export default AddStaffModal;
