const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appoinment");
const Prescription = require("../models/Prescription");
const MedicalRecord = require("../models/MedicalRecord");
const bcrypt = require("bcryptjs");

// GET ALL USERS (PAGINATED & FILTERED)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", role = "", status = "" } = req.query;
    const skip = (page - 1) * limit;

    let filters = {};

    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (role) {
      filters.role = role;
    }

    if (status) {
      filters.status = status;
    }

    const users = await User.find(filters)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-password");

    const total = await User.countDocuments(filters);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { name, email, role, status },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete associated doctor profile if exists
    if (user.role === "doctor") {
      await Doctor.deleteMany({ user: id });
    }

    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL APPOINTMENTS (PAGINATED & FILTERED)
exports.getAllAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "", doctor = "", patient = "", date = "" } = req.query;
    const skip = (page - 1) * limit;

    let filters = {};

    if (status) filters.status = status;
    if (doctor) filters.doctor = doctor;
    if (patient) filters.patient = patient;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filters.date = { $gte: startDate, $lte: endDate };
    }

    const appointments = await Appointment.find(filters)
      .populate("doctor", "user specialty")
      .populate("patient", "name email")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ date: -1 });

    const total = await Appointment.countDocuments(filters);

    res.json({
      appointments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// RESCHEDULE APPOINTMENT
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate, newTime, slotId } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { date: newDate, time: newTime, slot: slotId },
      { new: true }
    ).populate(["doctor", "patient"]);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Emit socket event
    if (req.io) {
      req.io.emit("appointment-rescheduled", {
        type: "appointment-rescheduled",
        message: `Appointment rescheduled from admin`,
        appointment,
        timestamp: new Date()
      });
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// REASSIGN APPOINTMENT TO DIFFERENT DOCTOR
exports.reassignAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDoctorId } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { doctor: newDoctorId },
      { new: true }
    ).populate(["doctor", "patient"]);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ANALYTICS
exports.getAnalytics = async (req, res) => {
  try {
    // Total appointments count
    const totalAppointments = await Appointment.countDocuments();

    // Completed appointments
    const completedAppointments = await Appointment.countDocuments({ status: "completed" });

    // Cancelled appointments
    const cancelledAppointments = await Appointment.countDocuments({ status: "cancelled" });

    // Total users
    const totalUsers = await User.countDocuments();
    const doctorsCount = await User.countDocuments({ role: "doctor" });
    const patientsCount = await User.countDocuments({ role: "patient" });

    // Appointments per day (last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const appointmentsPerDay = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Doctor productivity (total appointments per doctor)
    const doctorProductivity = await Appointment.aggregate([
      {
        $group: {
          _id: "$doctor",
          totalAppointments: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "_id",
          as: "doctorData"
        }
      },
      { $sort: { totalAppointments: -1 } },
      { $limit: 10 }
    ]);

    // Prescription stats
    const totalPrescriptions = await Prescription.countDocuments();
    const dispensedPrescriptions = await Prescription.countDocuments({ dispensed: true });

    // Medical records stats
    const totalMedicalRecords = await MedicalRecord.countDocuments();

    // Revenue calculation (if applicable - can be extended)
    const averageAppointmentsPerDay = appointmentsPerDay.length > 0
      ? appointmentsPerDay.reduce((sum, day) => sum + day.count, 0) / appointmentsPerDay.length
      : 0;

    res.json({
      appointments: {
        total: totalAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        pending: totalAppointments - completedAppointments - cancelledAppointments
      },
      users: {
        total: totalUsers,
        doctors: doctorsCount,
        patients: patientsCount
      },
      medical: {
        prescriptions: totalPrescriptions,
        dispensed: dispensedPrescriptions,
        medicalRecords: totalMedicalRecords
      },
      trends: {
        appointmentsPerDay,
        averagePerDay: Math.round(averageAppointmentsPerDay),
        doctorProductivity
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE STAFF
exports.createStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "staff",
      isVerified: true // Admin created staff is already verified
    });

    res.status(201).json({
      message: "Staff created successfully",
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET SYSTEM HEALTH
exports.getSystemHealth = async (req, res) => {
  try {
    const activeAppointmentsToday = await Appointment.countDocuments({
      date: new Date(),
      status: { $in: ["scheduled", "in-progress"] }
    });

    const onlineDoctors = await Doctor.countDocuments({ status: "online" });

    const upcomingAppointments = await Appointment.countDocuments({
      status: "scheduled",
      date: { $gte: new Date() }
    });

    res.json({
      activeAppointmentsToday,
      onlineDoctors,
      upcomingAppointments,
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
